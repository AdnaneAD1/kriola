import Image from 'next/image';
export function AuthLogo() {
  return (
    <div className="flex items-center">
      <span className="text-xl font-bold text-primary">
        <Image
          src="/kriola-removebg.png" // Chemin de l'image dans /public
          alt="Logo"
          width={200} // Largeur du logo
          height={200} // Hauteur du logo
          priority
        />
      </span>
    </div>
  );
}
