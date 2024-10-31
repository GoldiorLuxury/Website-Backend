import Product from '../models/product.model.js'; 

const addProduct = async (req, res) => {
    try {
        const { 
            name, 
            categories, 
            gender, 
            capacityInML, 
            stockLeft, 
            imgUrl, 
            description, 
            price, 
            discountPercentage 
        } = req.body;

        // Create a new product instance
        const newProduct = new Product({
            name,
            categories,
            gender,
            capacityInML,
            stockLeft,
            imgUrl,
            description,
            price,
            discountPercentage
        });

        // Save the product to the database
        await newProduct.save();

        // Send back the saved product data in the response
        res.status(201).json({
            id: newProduct._id,
            name: newProduct.name,
            categories: newProduct.categories,
            gender: newProduct.gender,
            capacityInML: newProduct.capacityInML,
            stockLeft: newProduct.stockLeft,
            imgUrl: newProduct.imgUrl,
            description: newProduct.description,
            price: newProduct.price,
            discountPercentage: newProduct.discountPercentage,
            createdAt: newProduct.createdAt,
            updatedAt: newProduct.updatedAt,
        });

    } catch (error) {
        console.error("Error in product add controller: ", error.message);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
};

const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = 6; 
        const skip = (page - 1) * pageSize;

        const products = await Product.find()
            .skip(skip) 
            .limit(pageSize);

        const totalProducts = await Product.countDocuments();

        const totalPages = Math.ceil(totalProducts / pageSize);

        res.status(200).json({
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                pageSize,
            },
        });

    } catch (error) {
        console.error("Error fetching products: ", error.message);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
};

export{ addProduct, getProducts};
