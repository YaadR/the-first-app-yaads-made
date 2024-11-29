import { Sparkles, Shield, Users } from 'lucide-react';

function About() {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-blue-500" />,
      title: 'AI-Powered Automation',
      description: 'Deploying cutting-edge AI to streamline and enhance your operations'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to safeguard your data and processes'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Client Focused',
      description: 'Trusted by businesses looking to optimize and innovate their workflows'
    }
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">About LeannOne</h2>
          <p className="text-xl text-gray-600">
          Revolutionizing Business Processes Through Advanced AI Agents
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
          At LeannOne, we deploy Leann's Agent to automate and optimize your business's
           existing systems and processes. With advanced AI technology, we streamline workflows
            and boost efficiency, letting you focus on what truly matters.
          </p>
          <p className="text-gray-600">
            Our tools are designed 
            to enhance your process and boost productivity.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;