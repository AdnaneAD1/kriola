import { db, firebaseAuth } from '@/lib/firebase'
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'

/**
 * Idempotent: si un user avec role=admin existe déjà dans Firestore, ne crée rien.
 * Sinon: crée un compte Firebase Auth + un document Firestore users avec role=admin.
 * Retourne un objet { created: boolean, message: string }
 */
export async function seedDefaultAdmin(options = {}) {
  const {
    email = 'admin@plasmacare.test',
    password = 'Admin123!',
    name = 'Admin',
  } = options

  // 1) Vérifier s'il existe déjà un admin dans Firestore
  const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'))
  const adminsSnap = await getDocs(adminsQuery)
  if (!adminsSnap.empty) {
    return { created: false, message: 'Un administrateur existe déjà.' }
  }

  // 2) Créer un utilisateur Auth (cela va connecter ce compte côté client)
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  const fbUser = cred.user
  if (name) {
    try { await updateProfile(fbUser, { displayName: name }) } catch {}
  }

  // 3) Créer le document Firestore users
  const data = {
    name,
    email,
    role: 'admin',
    firebaseUid: fbUser.uid,
    photoURL: fbUser.photoURL ?? null,
    phoneNumber: null,
    emailVerified: fbUser.emailVerified ?? false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
  await addDoc(collection(db, 'users'), data)

  return { created: true, message: "Administrateur par défaut créé et connecté." }
}
