import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  get: async (key) => AsyncStorage.getItem(key),
  set: async (key, value) => AsyncStorage.setItem(key, value),
  remove: async (key) => AsyncStorage.removeItem(key),
};

export default storage;
