const Categories = require('../models/categories');

module.exports = {

    get: async(req, res) => {
        const categories = await Categories.findAll();
        
        res.status(200).send({ categories: categories });
    }

}