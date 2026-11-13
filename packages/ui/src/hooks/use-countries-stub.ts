/** Stub for input-phone when no masters API is wired (admin SPA). */
export type CountryRow = {
  key: string;
  name: string;
  dialCode: string;
};

export function useCountriesQuery(_enabled = true) {
  const data: CountryRow[] = [
    { key: "IN", name: "India", dialCode: "+91" },
    { key: "US", name: "United States", dialCode: "+1" },
  ];
  return { data, isLoading: false, isError: false };
}
