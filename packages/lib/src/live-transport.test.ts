import { describe, expect, it } from "vitest";
import {
  decideTransport,
  type TransportDecisionInput,
} from "./live-transport";

function input(
  overrides: Partial<TransportDecisionInput> = {},
): TransportDecisionInput {
  return {
    mode: "auto",
    sseEnabled: true,
    socketConnected: true,
    socketDownMs: 0,
    sseSuspended: false,
    failoverConnectMs: 8_000,
    ...overrides,
  };
}

describe("decideTransport", () => {
  describe("admin-forced modes", () => {
    it("pins to the socket even while it is down", () => {
      expect(
        decideTransport(
          input({
            mode: "socket",
            socketConnected: false,
            socketDownMs: 120_000,
          }),
        ),
      ).toBe("socket");
    });

    it("pins to SSE even while the socket is healthy", () => {
      expect(decideTransport(input({ mode: "sse" }))).toBe("sse");
    });

    it("falls to polling when SSE is forced but disabled server-side", () => {
      expect(decideTransport(input({ mode: "sse", sseEnabled: false }))).toBe(
        "poll",
      );
    });

    it("pins to polling", () => {
      expect(decideTransport(input({ mode: "poll" }))).toBe("poll");
    });
  });

  describe("auto", () => {
    it("stays on the socket while it is connected", () => {
      expect(decideTransport(input())).toBe("socket");
    });

    it("rides out a short reconnect without switching", () => {
      expect(
        decideTransport(
          input({ socketConnected: false, socketDownMs: 7_999 }),
        ),
      ).toBe("socket");
    });

    it("fails over to SSE once the socket is down past the threshold", () => {
      expect(
        decideTransport(
          input({ socketConnected: false, socketDownMs: 8_000 }),
        ),
      ).toBe("sse");
    });

    it("skips SSE when the server has it disabled", () => {
      expect(
        decideTransport(
          input({
            socketConnected: false,
            socketDownMs: 20_000,
            sseEnabled: false,
          }),
        ),
      ).toBe("poll");
    });

    it("drops to polling while SSE is benched after a failure", () => {
      expect(
        decideTransport(
          input({
            socketConnected: false,
            socketDownMs: 20_000,
            sseSuspended: true,
          }),
        ),
      ).toBe("poll");
    });

    it("returns to the socket as soon as it reconnects", () => {
      expect(
        decideTransport(
          input({ socketConnected: true, socketDownMs: 0, sseSuspended: true }),
        ),
      ).toBe("socket");
    });
  });
});
