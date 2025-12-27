import React from 'react';

const DashboardHeader = ({ user }) => {
  // Fonction pour déterminer le message de salutation en fonction de l'heure
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-3xl font-bold text-[#1B396A]">Tableau de bord</h1>
        <div className="mt-4">
          <h2 className="text-lg leading-6 font-medium text-[#1B396A]">
            {getGreeting()}, {user.nom}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {user.role === 'chef_departement' 
              ? 'Gérez votre département' 
              : 'Gérez vos courses et vos matières'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;