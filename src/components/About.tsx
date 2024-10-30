import { Sparkles, Shield, Users } from 'lucide-react';

function About() {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-blue-500" />,
      title: 'AI-Powered Innovation',
      description: 'Cutting-edge AI technology to transform your ideas into reality'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to protect your data and privacy'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Community Driven',
      description: 'Join thousands of creators and innovators using our platform'
    }
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">About The Koko App</h2>
          <p className="text-xl text-gray-600">
            Empowering creativity through artificial intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-gray-600 mb-6">
            At The Koko App, we're dedicated to making advanced AI technology accessible to everyone. 
            Our platform combines state-of-the-art image generation and natural language processing 
            to help you bring your creative visions to life.
          </p>
          <p className="text-gray-600">
            Whether you're an artist, developer, or business professional, our tools are designed 
            to enhance your creative process and boost productivity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;