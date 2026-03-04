export interface Company {
  id: string;
  company_name: string;
  industry: string;
  province: string;
  location: {
    lat: number;
    lon: number;
  };
  accept_interns: boolean;
}

export interface FilterState {
  keyword: string;
  industry: string;
}
