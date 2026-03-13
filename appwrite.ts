import { Client, Databases, Account, Storage } from 'appwrite';

// Inicializamos el cliente de Appwrite
const client = new Client();

// Configuramos el cliente con las variables de entorno
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1') // Tu API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''); // Tu Project ID

// Exportamos los servicios que vamos a utilizar
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Exportamos las constantes de los IDs para usarlas fácilmente en otros archivos
export const APPWRITE_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const APPWRITE_COLLECTION_PROJECTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTS_ID || '';