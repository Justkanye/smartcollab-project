"use server";

import { cookies } from "next/headers";

export type TokensInput = {
  name: string;
  value: string;
  expiration: string | number;
};

export const setCookie = async ({ name, value, expiration }: TokensInput) => {
  const cookieStore = await cookies();
  await cookieStore.set(name, value, {
    httpOnly: true,
    sameSite: true,
    ...(expiration
      ? {
          expires:
            typeof expiration === "string" ? new Date(expiration) : expiration,
        }
      : {}),
  });
};

export const removeCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete({
    name,
  });
  return true;
};

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie;
};

export const getCookieAsync = async (name: string) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie;
};
