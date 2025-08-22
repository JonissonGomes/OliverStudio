import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Camera, Users, Baby, GraduationCap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import weddingImage from "@/assets/wedding-service.jpg";
import portraitImage from "@/assets/portrait-service.jpg";
import eventImage from "@/assets/event-service.jpg";

const Services = () => {
  const services = [
    {
      title: "Casamentos",
      description: "Capture cada momento especial do seu grande dia com nossa equipe especializada em fotografia de casamento.",
      features: ["Cerimônia completa", "Ensaio pré-wedding", "Álbum personalizado", "Fotos digitais em alta resolução"],
      icon: Heart,
      image: weddingImage,
      price: "A partir de R$ 2.500"
    },
    {
      title: "Retratos e Ensaios",
      description: "Sessões personalizadas para capturar a sua essência em retratos únicos e memoráveis.",
      features: ["Sessão individual ou em grupo", "Looks variados", "Retoque profissional", "Galeria online"],
      icon: Camera,
      image: portraitImage,
      price: "A partir de R$ 350"
    },
    {
      title: "Eventos Corporativos",
      description: "Cobertura profissional para eventos empresariais, formaturas e celebrações especiais.",
      features: ["Cobertura completa", "Fotos espontâneas", "Entrega rápida", "Direitos de uso comercial"],
      icon: Users,
      image: eventImage,
      price: "A partir de R$ 800"
    },
    {
      title: "Gestantes e Newborn",
      description: "Momentos únicos da maternidade e primeiros dias do bebê capturados com delicadeza.",
      features: ["Ensaio gestante", "Newborn em estúdio", "Props inclusos", "Ambiente aquecido"],
      icon: Baby,
      image: portraitImage,
      price: "A partir de R$ 450"
    },
    {
      title: "Formaturas",
      description: "Registre essa conquista importante com fotos profissionais de formatura individual e em grupo.",
      features: ["Fotos individuais", "Fotos em grupo", "Capelo e beca", "Entrega digital"],
      icon: GraduationCap,
      image: eventImage,
      price: "A partir de R$ 200"
    },
    {
      title: "Debutantes",
      description: "Celebre os 15 anos com uma sessão de fotos especial para marcar essa data importante.",
      features: ["Looks variados", "Cenários personalizados", "Maquiagem inclusa", "Álbum de luxo"],
      icon: Crown,
      image: portraitImage,
      price: "A partir de R$ 600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nossos Serviços
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos uma ampla gama de serviços fotográficos para capturar seus momentos mais especiais
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.title} className="overflow-hidden shadow-soft hover:shadow-medium transition-shadow">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${service.image})` }}>
                  <div className="h-full bg-black/40 flex items-center justify-center">
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-foreground">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-photography-gold rounded-full mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">{service.price}</span>
                    <Button variant="elegant" size="sm" asChild>
                      <Link to="/contato">Orçamento</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Process Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Como Trabalhamos
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-photography-warm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-foreground">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Consulta</h3>
              <p className="text-muted-foreground text-sm">
                Conversamos sobre suas necessidades e criamos um plano personalizado.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-photography-warm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-foreground">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Planejamento</h3>
              <p className="text-muted-foreground text-sm">
                Definimos local, horário e todos os detalhes para garantir o sucesso.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-photography-warm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-foreground">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sessão</h3>
              <p className="text-muted-foreground text-sm">
                Realizamos a sessão com equipamento profissional e muita criatividade.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-photography-warm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-foreground">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Entrega</h3>
              <p className="text-muted-foreground text-sm">
                Tratamos e entregamos suas fotos com a qualidade que você merece.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card rounded-lg p-8 shadow-soft">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre em contato conosco para discutir seu projeto e receber um orçamento personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/contato">Agendar Sessão</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/sobre">Conhecer Nossa História</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;