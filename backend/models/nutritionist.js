/**
 * Modelo Nutricionista (MongoDB nativo)
 * Colección: nutritionists
 */

class Nutritionist {
  constructor(data) {
    this.name = data.name;
    this.specialization = data.specialization;
    this.email = data.email;
    this.phone = data.phone;
    this.bio = data.bio;
    this.certifications = data.certifications || [];
    this.languages = data.languages || [];
    this.experience = data.experience || 0;
    this.rating = data.rating || 0;
    this.totalConsultations = data.totalConsultations || 0;
    this.availability = data.availability || {};
    this.consultationPrice = data.consultationPrice || 0;
    this.isActive = data.isActive ?? true;
    this.isAvailable = data.isAvailable ?? true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // 🔹 Obtener colección
  static collection(db) {
    return db.collection('nutritionists');
  }

  // 🔹 Obtener todos
  static async findAll(db, filter = {}) {
    return await this.collection(db).find(filter).toArray();
  }

  // 🔹 Obtener por ID
  static async findById(db, id) {
    const { ObjectId } = require('mongodb');
    return await this.collection(db).findOne({ _id: new ObjectId(id) });
  }

  // 🔹 Crear
  static async create(db, data) {
    const nutritionist = new Nutritionist(data);
    const result = await this.collection(db).insertOne(nutritionist);
    return result;
  }

  // 🔹 Actualizar
  static async update(db, id, data) {
    const { ObjectId } = require('mongodb');
    data.updatedAt = new Date();

    return await this.collection(db).updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
  }

  // 🔹 Eliminar
  static async delete(db, id) {
    const { ObjectId } = require('mongodb');
    return await this.collection(db).deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Nutritionist;
