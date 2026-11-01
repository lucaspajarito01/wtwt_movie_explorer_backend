// Clase base de los repositorios: recibe el pool por constructor (inyección de dependencias).
// Cada método acepta una conexión opcional para participar en una transacción.
export default class BaseRepository {
  #db;

  constructor(db) {
    if (new.target === BaseRepository) {
      throw new TypeError("BaseRepository es abstracta");
    }
    this.#db = db;
  }

  executor(conn) {
    return conn ?? this.#db;
  }
}
