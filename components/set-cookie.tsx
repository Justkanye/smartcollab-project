"use client";

import { setCookie } from "@/app/actions/cookie.actions";
import { useEffect } from "react";

type SetCookieProps = {
  name: string;
  value?: string;
  expiration: string | number;
};

const SetCookie = ({ name, value, expiration }: SetCookieProps) => {
  useEffect(() => {
    if (!name || !value || !expiration) return;
    setCookie({ name, value, expiration });
  }, []);
  return null;
};

export default SetCookie;
