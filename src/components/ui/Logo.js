import Image from 'next/image';
export function Logo() {
  return (
    <div className="flex items-center">
      <span className="text-xl font-bold text-primary">
        <Image
          src="/kriola-removebg.png" // Chemin de l'image dans /public
          alt="Logo"
          width={100} // Largeur du logo
          height={100} // Hauteur du logo
          priority
        />
      </span>
    </div>
  );
}
