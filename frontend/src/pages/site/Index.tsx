import { Link } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Camera, Heart, Star, Users, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import heroImage from "@/assets/hero-image.jpg";
import weddingService from "@/assets/wedding-service.jpg";
import portraitService from "@/assets/portrait-service.jpg";
import eventService from "@/assets/event-service.jpg";

const services = [
  {
    id: "casamentos",
    title: "Casamentos",
    description: "Eternize o seu dia mais especial com fotografias que contam a história do seu amor.",
    image: weddingService,
    features: ["Cerimônia completa", "Ensaio pré-wedding", "Álbum personalizado"]
  },
  {
    id: "retratos",
    title: "Retratos e Book",
    description: "Portraits profissionais que capturam sua personalidade e beleza única.",
    image: portraitService,
    features: ["Estúdio profissional", "Looks variados", "Edição artística"]
  },
  {
    id: "eventos",
    title: "Eventos Sociais",
    description: "Aniversários, formaturas, debutantes e momentos especiais da sua família.",
    image: eventService,
    features: ["Cobertura completa", "Fotos espontâneas", "Entrega rápida"]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:bg-cover md:bg-cover lg:bg-cover xl:bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Capturamos
            <span className="block text-foreground">
              Momentos Únicos
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transformamos suas memórias mais preciosas em arte que durará para sempre
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="xl" asChild>
              <Link to="/contato">
                Agendar Sessão
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/servicos">Ver Serviços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Sobre o Oliver Estudios
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Com mais de 10 anos de experiência, somos especializados em capturar 
              momentos únicos e transformá-los em memórias eternas. Nossa paixão 
              pela fotografia e atenção aos detalhes garantem resultados excepcionais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-medium">
                <Heart className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Paixão</h3>
              <p className="text-muted-foreground">
                Cada foto é criada com amor e dedicação aos detalhes
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-medium">
                <Star className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Qualidade</h3>
              <p className="text-muted-foreground">
                Equipamentos profissionais e técnicas avançadas
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-hero rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-medium">
                <Users className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Experiência</h3>
              <p className="text-muted-foreground">
                Milhares de momentos capturados e clientes satisfeitos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Nossos Serviços
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma gama completa de serviços fotográficos para todos os momentos especiais da sua vida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-card rounded-lg shadow-medium hover:shadow-strong transition-shadow overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-photography-gold mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="gold" className="w-full" asChild>
                    <Link to="/contato">Agendar Sessão</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
