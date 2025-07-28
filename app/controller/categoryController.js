const Category = require("../model/Category");

class CategoryController {
  // Create a new category
  async createCategory(req, res) {
    try {
      const { name } = req.body;
      const category = await Category.create({ name });
      res.status(201).json({ status: true, category });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find();
      res.status(200).json({ status: true, categories });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }
}

module.exports = new CategoryController();
