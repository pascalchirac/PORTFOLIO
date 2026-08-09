import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title:"EPEY Pascal Chirac — Support IT N2", description:"Portfolio professionnel — Support IT N1/N2, exploitation, réseaux et supervision à Lomé.", icons:{icon:"/favicon.svg"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
