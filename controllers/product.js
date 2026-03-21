import Product from "../models/product.js";

export const createProduct = async (req, res) => {
    const { id, name, price, costPrice, quantity, category, minStockLevel } = req.body;
    try {
        const newProduct = new Product({
            id, // Flexible ID
            name,
            price,
            costPrice,
            quantity,
            category,
            minStockLevel
        });
        await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const restockProduct = async (req, res) => {
    const { productId, addedQuantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        product.quantity += Number(addedQuantity);
        await product.save();
        res.status(200).json({ message: "Stock updated", product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category, price, costPrice, quantity, minStockLevel, id: customId } = req.body;
    try {
        // Also allow updating the string 'id' if needed
        const updates = { name, category, price, costPrice, quantity, minStockLevel };
        if (customId) updates.id = customId;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
