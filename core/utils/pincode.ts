export interface PincodeLookupResult {
  state: string;
  city: string;
  district: string;
}

interface PostalApiOffice {
  State: string;
  District: string;
}

interface PostalApiResponse {
  Status: string;
  PostOffice?: PostalApiOffice[];
}

/**
 * Resolves Indian state and district (city) from a 6-digit PIN code
 * using the public India Post PIN code API.
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  if (!/^\d{6}$/.test(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;

    const data = (await res.json()) as PostalApiResponse[];
    const entry = data[0];
    if (entry?.Status !== 'Success' || !entry.PostOffice?.length) return null;

    const office = entry.PostOffice[0];
    return {
      state: office.State,
      city: office.District,
      district: office.District,
    };
  } catch {
    return null;
  }
}
