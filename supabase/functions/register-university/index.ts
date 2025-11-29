import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UniversityRegistrationRequest {
  legalName: string;
  type: "CENTRAL" | "STATE" | "PRIVATE" | "DEEMED";
  state: string;
  ugcReference?: string;
  aisheCode?: string;
  websiteDomain: string;
  registrarOfficialEmail: string;
  walletAddress: string;
}

const validateEmail = (email: string, domain: string): boolean => {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  const websiteDomain = domain.toLowerCase();

  // Check if email domain matches website domain
  if (emailDomain === websiteDomain) {
    return true;
  }

  // Check if email ends with .edu.in or .ac.in
  if (
    emailDomain?.endsWith(".edu.in") ||
    emailDomain?.endsWith(".ac.in")
  ) {
    return true;
  }

  return false;
};

const validateAisheCode = (code: string): boolean => {
  const pattern = /^[A-Z]-[0-9]{3,6}$/;
  return pattern.test(code);
};

const validateWalletAddress = (address: string): boolean => {
  const pattern = /^0x[a-fA-F0-9]{40}$/;
  return pattern.test(address);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: UniversityRegistrationRequest = await req.json();

    // Server-side validation
    const errors: Record<string, string> = {};

    // Validate legal name
    if (!requestData.legalName || requestData.legalName.length < 3) {
      errors.legalName = "University legal name must be at least 3 characters";
    }
    if (requestData.legalName && requestData.legalName.length > 255) {
      errors.legalName = "University legal name must not exceed 255 characters";
    }

    // Validate type
    const validTypes = ["CENTRAL", "STATE", "PRIVATE", "DEEMED"];
    if (!requestData.type || !validTypes.includes(requestData.type)) {
      errors.type = "Invalid university type";
    }

    // Validate state
    if (!requestData.state) {
      errors.state = "State is required";
    }

    // Validate AISHE code if provided
    if (
      requestData.aisheCode &&
      requestData.aisheCode.length > 0 &&
      !validateAisheCode(requestData.aisheCode)
    ) {
      errors.aisheCode = "AISHE code must follow pattern: A-123456";
    }

    // Validate website domain
    if (!requestData.websiteDomain) {
      errors.websiteDomain = "Website domain is required";
    }
    const domainPattern =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (
      requestData.websiteDomain &&
      !domainPattern.test(requestData.websiteDomain)
    ) {
      errors.websiteDomain = "Invalid domain format";
    }

    // Validate registrar email
    if (!requestData.registrarOfficialEmail) {
      errors.registrarOfficialEmail = "Registrar email is required";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      requestData.registrarOfficialEmail &&
      !emailPattern.test(requestData.registrarOfficialEmail)
    ) {
      errors.registrarOfficialEmail = "Invalid email format";
    }

    // Validate email domain
    if (
      requestData.registrarOfficialEmail &&
      requestData.websiteDomain &&
      !validateEmail(requestData.registrarOfficialEmail, requestData.websiteDomain)
    ) {
      errors.registrarOfficialEmail =
        "Registrar email must match university domain or end with .edu.in/.ac.in";
    }

    // Validate wallet address
    if (!requestData.walletAddress) {
      errors.walletAddress = "Wallet address is required";
    }
    if (
      requestData.walletAddress &&
      !validateWalletAddress(requestData.walletAddress)
    ) {
      errors.walletAddress = "Invalid wallet address format";
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for duplicate registrations (same domain or email)
    const { data: existingUniversity } = await supabase
      .from("universities")
      .select("id, verification_status")
      .or(
        `website_domain.eq.${requestData.websiteDomain.toLowerCase()},registrar_official_email.eq.${requestData.registrarOfficialEmail.toLowerCase()}`
      )
      .limit(1)
      .single();

    if (existingUniversity) {
      return new Response(
        JSON.stringify({
          error: "University with this domain or email already exists",
          details: {
            existing: existingUniversity.verification_status,
          },
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the new university registration
    const { data, error } = await supabase
      .from("universities")
      .insert({
        legal_name: requestData.legalName,
        type: requestData.type,
        state: requestData.state,
        ugc_reference: requestData.ugcReference || null,
        aishe_code: requestData.aisheCode || null,
        website_domain: requestData.websiteDomain.toLowerCase(),
        registrar_official_email: requestData.registrarOfficialEmail.toLowerCase(),
        wallet_address: requestData.walletAddress.toLowerCase(),
        verification_status: "PENDING",
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "University registered successfully",
        data: data?.[0],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
