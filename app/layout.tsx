import type { Metadata } from "next";
import "./globals.css";

const title = "EPEY Pascal Chirac — Technicien NOC & Support IT N2";
const description = "Portfolio professionnel orienté NOC : supervision, monitoring, réseaux, gestion d’incidents, CompTIA Security+ et sécurité opérationnelle, avec une évolution structurée vers le SOC.";
export const metadata: Metadata = { metadataBase:new URL("https://epey-pascal-chirac-portfolio.manu-gazdetect.chatgpt.site"), title, description, icons:{icon:"/favicon.svg"}, openGraph:{title,description,type:"website",images:[{url:"/og-noc-soc.png",width:1732,height:909,alt:"EPEY Pascal Chirac — Technicien NOC & Support IT N2"}]}, twitter:{card:"summary_large_image",title,description,images:["/og-noc-soc.png"]} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
