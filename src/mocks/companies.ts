import type { Company } from "../types";

export const COMPANIES: Company[] = [
  {
    id: "co1",
    name: "Home Care Vida Plena",
    cnpj: "12.345.678/0001-90",
    city: "Cidade Média - Centro",
    phone: "(11) 99999-0000",
    email: "contato@vidaplena.com.br",
    approvalStatus: "approved",
    favoriteCaregiverIds: ["cg1", "cg8"],
  },
  {
    id: "co2",
    name: "Cuidar Bem Serviços de Home Care",
    cnpj: "98.765.432/0001-10",
    city: "Cidade Média - Zona Norte",
    phone: "(11) 98888-1111",
    email: "contato@cuidarbem.com.br",
    approvalStatus: "approved",
    favoriteCaregiverIds: [],
  },
];
