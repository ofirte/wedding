import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import React, { ReactNode } from "react";

// Create RTL cache for Hebrew/RTL languages
const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

// Create LTR cache for English/LTR languages
const ltrCache = createCache({
  key: "muiltr",
});

interface RTLCacheProviderProps {
  children: ReactNode;
  isRtl: boolean;
}

export const RTLCacheProvider: React.FC<RTLCacheProviderProps> = ({
  children,
  isRtl,
}) => {
  const cache = isRtl ? rtlCache : ltrCache;

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export { rtlCache, ltrCache };
