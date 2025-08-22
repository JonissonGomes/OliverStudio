import { Camera, Mail, Phone, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-hero rounded-lg shadow-soft">
                <Camera className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Oliver Estudios
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Capturamos os momentos mais especiais da sua vida com qualidade 
              profissional e um olhar artístico único. Transformamos memórias 
              em arte que dura para sempre.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background hover:bg-accent rounded-lg transition-colors shadow-soft"
              >
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background hover:bg-accent rounded-lg transition-colors shadow-soft"
              >
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/sobre" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link 
                  to="/servicos" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Serviços
                </Link>
              </li>
              <li>
                <Link 
                  to="/contato" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link 
                  to="/fotos" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Acessar Fotos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">(11) 99999-9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">contato@oliverestudios.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Oliver Estudios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;