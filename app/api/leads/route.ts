import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clientname,
      phone,
      email,
      source,
      eventtype,
      campaign,
    } = body;

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          clientname,
          phone,
          email,
          source,
          eventtype,
          campaign,
          status: "New Lead",
        },
      ])
      .select();

    if (error) {
      console.log(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: data,
    });

  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}