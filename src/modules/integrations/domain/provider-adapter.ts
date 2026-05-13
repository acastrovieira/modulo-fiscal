export type ProviderAdapterCapability = "SIMULATE" | "ISSUE" | "CANCEL" | "QUERY_STATUS";

export type ProviderAdapterDescriptor = {
  id: string;
  name: string;
  capabilities: ProviderAdapterCapability[];
  isEnabled: boolean;
};
