import { 
  collection, doc, onSnapshot, setDoc, getDocs, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, ElectronicInvoice, BoutiqueProfile } from '../types';

export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  INVOICES: 'invoices',
  PROFILES: 'profiles',
};

// Listen to products in real-time
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  fallbackData: Product[]
) {
  const path = COLLECTIONS.PRODUCTS;
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Product);
        });
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    console.warn('Could not attach Firestore product listener, using local:', err);
    onData([]);
    return () => {};
  }
}

// Listen to orders in real-time
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  fallbackData: Order[]
) {
  const path = COLLECTIONS.ORDERS;
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Order);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    console.warn('Could not attach Firestore orders listener, using local:', err);
    onData([]);
    return () => {};
  }
}

// Listen to invoices in real-time
export function subscribeToInvoices(
  onData: (invoices: ElectronicInvoice[]) => void,
  fallbackData: ElectronicInvoice[]
) {
  const path = COLLECTIONS.INVOICES;
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ElectronicInvoice[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ElectronicInvoice);
        });
        list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        onData(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    console.warn('Could not attach Firestore invoices listener, using local:', err);
    onData([]);
    return () => {};
  }
}

// Listen to boutique profile
export function subscribeToProfile(
  onData: (profile: BoutiqueProfile) => void,
  fallbackProfile: BoutiqueProfile
) {
  const path = `${COLLECTIONS.PROFILES}/boutique`;
  try {
    const docRef = doc(db, COLLECTIONS.PROFILES, 'boutique');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as BoutiqueProfile);
        } else {
          setDoc(docRef, fallbackProfile).catch((err) => {
            console.warn('Seeding profile to Firestore error:', err);
          });
          onData(fallbackProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    console.warn('Could not attach Firestore profile listener, using local:', err);
    onData(fallbackProfile);
    return () => {};
  }
}

// Cloud mutation operations with compliant error handling
export async function syncSaveProduct(product: Product) {
  const path = `${COLLECTIONS.PRODUCTS}/${product.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncDeleteProduct(productId: string) {
  const path = `${COLLECTIONS.PRODUCTS}/${productId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncSaveOrder(order: Order) {
  const path = `${COLLECTIONS.ORDERS}/${order.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncUpdateOrderStatus(orderId: string, status: string) {
  const path = `${COLLECTIONS.ORDERS}/${orderId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncSaveInvoice(invoice: ElectronicInvoice) {
  const path = `${COLLECTIONS.INVOICES}/${invoice.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INVOICES, invoice.id), invoice);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncSaveProfile(profile: BoutiqueProfile) {
  const path = `${COLLECTIONS.PROFILES}/boutique`;
  try {
    await setDoc(doc(db, COLLECTIONS.PROFILES, 'boutique'), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Clear all collections from Firestore to have a fresh clean boutique
export async function clearAllFirestoreData() {
  const collectionsToClear = [COLLECTIONS.PRODUCTS, COLLECTIONS.ORDERS, COLLECTIONS.INVOICES];
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn(`Error clearing Firestore collection ${colName}:`, err);
    }
  }
}

