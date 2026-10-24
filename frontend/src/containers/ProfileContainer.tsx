"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProfileView } from "@/components/profile/ProfileView";
import { ApiError } from "@/lib/api";
import { getMyCompany, updateMyCompany } from "@/lib/endpoints";

const profileSchema = z.object({
  address: z.string(),
  phone: z.string(),
  email: z.string().refine((v) => v === "" || z.email().safeParse(v).success, "Email nije validan"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const formatClock = (timestamp: number) =>
  timestamp ? new Date(timestamp).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

export function ProfileContainer() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isPending, dataUpdatedAt } = useQuery({ queryKey: ["company", "me"], queryFn: getMyCompany });
  const company = data?.company;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { address: "", phone: "", email: "" },
  });

  // forma se popuni kad stignu podaci firme
  useEffect(() => {
    if (company) reset({ address: company.address ?? "", phone: company.phone ?? "", email: company.email ?? "" });
  }, [company, reset]);

  async function onSubmit(values: ProfileValues) {
    setFormError(null);
    try {
      // backend odbija prazne stringove — šaljemo samo popunjena polja (brisanje polja API ne podržava)
      const orUndefined = (v: string) => v.trim() || undefined;
      await updateMyCompany({
        address: orUndefined(values.address),
        phone: orUndefined(values.phone),
        email: orUndefined(values.email),
      });
      await queryClient.invalidateQueries({ queryKey: ["company", "me"] });
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Došlo je do greške");
    }
  }

  function discardChanges() {
    setFormError(null);
    if (company) reset({ address: company.address ?? "", phone: company.phone ?? "", email: company.email ?? "" });
  }

  return (
    <ProfileView
      companyName={company?.name}
      fields={{ address: register("address"), phone: register("phone"), email: register("email") }}
      errors={errors}
      formError={formError}
      isLoading={isPending}
      isSubmitting={isSubmitting}
      syncedAt={formatClock(dataUpdatedAt)}
      onSubmit={handleSubmit(onSubmit)}
      onDiscard={discardChanges}
    />
  );
}
