"use server";

import { getTemplatesPage } from "@/features/templates/queries/get-templates.query";

export async function getTemplatesPageAction(params: { categorySlug?: string; page: number }) {
  return getTemplatesPage(params);
}
