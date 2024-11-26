import "./globals.css";
import { Providers } from "@/redux/provider";
import { AuthenticatedLayout } from "@/hooks/AuthenticatedLayout";
import Spinner from "./components/Spinner";
import SideBar from "./components/SideBar";
import { Banner } from "@/assets";
import Image from "next/image";
import DeviceDetector from "./components/DeviceDetector";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>MIP</title>
        <link rel="icon" href="/icon.ico" />
        <meta property="og:image" content="/icon.ico"></meta>
        <meta
          name="description"
          content="Plataforma para gestionar reservas de sala de estudio Made in Pilar"
        ></meta>
        <meta name="author" content="Federico Marquez"></meta>
        <meta
          name="copyright"
          content="MIP. Todos los derechos reservados."
        ></meta>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta name="robots" content="index, follow"></meta>
        <meta property="og:title" content="MIP"></meta>
        <meta
          property="og:description"
          content="Plataforma para gestionar reservas de sala de estudio Made in Pilar"
        ></meta>
        <meta name="twitter:title" content="MIP"></meta>
        <meta
          name="twitter:description"
          content="Plataforma para gestionar reservas de sala de estudio Made in Pilar"
        ></meta>
        <meta name="twitter:card" content="summary"></meta>
      </head>
      <body className={`antialiased h-screen w-screen bg-[#0a0a0a]`}>
        <Providers>
          <DeviceDetector />
          <Spinner></Spinner>
          <AuthenticatedLayout>
            <Image
              src={Banner}
              alt="banner"
              height={1440}
              width={1440}
              className="object-cover w-screen h-screen absolute top-0 left-0 -z-50"
            />
            <div className="flex lg:flex-row flex-col">
              <SideBar />
              {children}
            </div>
          </AuthenticatedLayout>
        </Providers>
      </body>
    </html>
  );
}
