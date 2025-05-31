import { Role } from "@/app/generated/prisma";
import { checkUserExists } from "@/libs/user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const nameRaw = formData.get("name");
  const roleRaw = formData.get("role");
  const emailRaw = formData.get("email");
  const specializationRaw = formData.get("specialization");
  const openingRaw = formData.get("opening");
  const closingRaw = formData.get("closing");
  const daysRaw = formData.getAll("days");

  if (!nameRaw || !roleRaw || !emailRaw) {
    return new NextResponse(JSON.stringify({ message: "Missing parameters" }), {
      status: 400,
    });
  }

  const name = nameRaw.toString();
  const email = emailRaw.toString();
  const role = roleRaw.toString() as Role;

  if (!Object.values(Role).includes(role)) {
    return new NextResponse(JSON.stringify({ message: "Invalid role" }), {
      status: 400,
    });
  }

  const userExists = await checkUserExists({ email });

  if (userExists) {
    return new NextResponse(
      JSON.stringify({
        message: "User with that email or phone already exists",
      }),
      {
        status: 400,
      }
    );
  }

  if (role === "DOCTOR") {
    if (!specializationRaw || !openingRaw || !closingRaw) {
      return new NextResponse(
        JSON.stringify({ message: "Missing DOCTORS parameters" }),
        {
          status: 400,
        }
      );
    }

    const specialization = specializationRaw.toString();
    const opening = openingRaw.toString();
    const closing = closingRaw.toString();

    const daysAvailable: number[] = daysRaw
      .map((d) => parseInt(d.toString(), 10))
      .filter((d) => !isNaN(d));

    if (daysAvailable.length < 1) {
      return new NextResponse(
        JSON.stringify({ message: "Missing DOCTORS parameters" }),
        {
          status: 400,
        }
      );
    }

    return createDoctor({
      name,
      email,
      specialization,
      opening,
      closing,
      daysAvailable,
    });
  } else if (role === "PATIENT") {
    return createPatient({ email, name });
  }

  return new NextResponse(
    JSON.stringify({ message: "Internal Server Error!" }),
    { status: 500 }
  );
}

interface ICreateDoctorParams {
  name: string;
  email: string;
  specialization: string;
  daysAvailable: number[];
  opening: string;
  closing: string;
}
async function createDoctor({
  name,
  email,
  specialization,
  daysAvailable,
  opening,
  closing,
}: ICreateDoctorParams) {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, role: "DOCTOR" },
    });

    const doctor = await tx.doctor.create({
      data: {
        userId: user.id,
        specialization,
        availability: {
          create: {
            daysAvailable,
            opening,
            closing,
          },
        },
      },
    });
    return { user, doctor };
  });

  return new NextResponse(
    JSON.stringify({ message: "Created Doctor!", data: result.user }),
    { status: 201 }
  );
}

interface ICreatePatientParams {
  name: string;
  email: string;
}
async function createPatient({ name, email }: ICreatePatientParams) {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, role: "PATIENT" },
    });

    const patient = await tx.patient.create({
      data: {
        userId: user.id,
      },
    });

    return { user, patient };
  });

  return new NextResponse(
    JSON.stringify({ message: "Created Patient!", data: result.user }),
    { status: 201 }
  );
}
