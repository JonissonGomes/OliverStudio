import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/enhanced-button";
import { Camera, Award, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Sobre Oliver Estudios
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transformamos momentos especiais em memórias eternas através da arte da fotografia
          </p>
        </section>

        {/* Story Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Nossa História</h2>
            <p className="text-muted-foreground mb-4">
              O Oliver Estudios nasceu da paixão por capturar momentos únicos e especiais. 
              Com mais de 5 anos de experiência, nos especializamos em criar imagens que 
              contam histórias e preservam as emoções mais preciosas da vida.
            </p>
            <p className="text-muted-foreground mb-6">
              Nossa equipe de fotógrafos profissionais combina técnica apurada com 
              sensibilidade artística para entregar resultados que superam expectativas.
            </p>
            <Button variant="elegant" asChild>
              <Link to="/contato">Conheça Nosso Trabalho</Link>
            </Button>
          </div>
          <div className="bg-card rounded-lg p-8 shadow-soft">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <Camera className="h-8 w-8 text-photography-gold mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">500+</h3>
                <p className="text-sm text-muted-foreground">Eventos Fotografados</p>
              </div>
              <div>
                <Users className="h-8 w-8 text-photography-gold mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">1000+</h3>
                <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
              </div>
              <div>
                <Award className="h-8 w-8 text-photography-gold mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">5+</h3>
                <p className="text-sm text-muted-foreground">Anos de Experiência</p>
              </div>
              <div>
                <Heart className="h-8 w-8 text-photography-gold mx-auto mb-2" />
                <h3 className="font-semibold text-foreground">100%</h3>
                <p className="text-sm text-muted-foreground">Dedicação</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-photography-warm rounded-lg p-6 mb-4 mx-auto w-fit">
                <Camera className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Qualidade</h3>
              <p className="text-muted-foreground">
                Comprometemos-nos com a excelência em cada foto, utilizando equipamentos 
                de última geração e técnicas profissionais.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-photography-warm rounded-lg p-6 mb-4 mx-auto w-fit">
                <Heart className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Paixão</h3>
              <p className="text-muted-foreground">
                Cada projeto é desenvolvido com amor e dedicação, capturando a 
                essência e emoção de cada momento especial.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-photography-warm rounded-lg p-6 mb-4 mx-auto w-fit">
                <Users className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Confiança</h3>
              <p className="text-muted-foreground">
                Construímos relacionamentos duradouros baseados na confiança 
                e na entrega de resultados excepcionais.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card rounded-lg p-8 shadow-soft">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para Imortalizar Seus Momentos?
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre em contato conosco e vamos criar juntos memórias que durarão para sempre.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/contato">Agendar Sessão</Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;