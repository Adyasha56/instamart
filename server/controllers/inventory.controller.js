/**
 * Creates a new inventory record
 * @param {import("express").Request} req - The request object containing inventory details in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the result of the operation
 */
export const createInventory = async (req, res) => {
  try {
    const { store_id, product_id, stock, selling_price, discount_percentage } = req.body;

    // Validate store_id
    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      return Responses.failResponse(res, "Invalid or missing store ID", 400);
    }

    // Validate product_id
    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return Responses.failResponse(res, "Invalid or missing product ID", 400);
    }

    // Validate stock
    if (typeof stock !== "number" || stock < 0) {
      return Responses.failResponse(res, "Invalid stock value", 400);
    }

    // Validate selling_price
    if (typeof selling_price !== "number" || selling_price < 0) {
      return Responses.failResponse(res, "Invalid selling price", 400);
    }

    // Validate discount_percentage
    if (typeof discount_percentage !== "number" || discount_percentage < 0 || discount_percentage > 100) {
      return Responses.failResponse(res, "Invalid discount percentage", 400);
    }

    const inventory = await Inventory.create({
      store_id,
      product_id,
      stock,
      selling_price,
      discount_percentage
    });

    return Responses.successResponse(res, "Inventory record created successfully", 201, inventory);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Updates an inventory record
 * @param {import("express").Request} req - The request object containing inventory ID in the URL params and updated data in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the updated inventory details
 */
export const updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const updateData = req.body;

    // Validate inventoryId
    if (!inventoryId || !mongoose.Types.ObjectId.isValid(inventoryId)) {
      return Responses.failResponse(res, "Invalid inventory ID", 400);
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(inventoryId, updateData, { new: true });

    if (!updatedInventory) {
      return Responses.failResponse(res, "Inventory record not found or update failed", 404);
    }

    return Responses.successResponse(res, "Inventory record updated successfully", 200, updatedInventory);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Fetches inventory details for a specific store or product
 * @param {import("express").Request} req - The request object containing query parameters for store_id or product_id
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the inventory details
 */
export const getInventory = async (req, res) => {
  try {
    const { store_id, product_id } = req.query;

    const query = {};
    if (store_id) {
      if (!mongoose.Types.ObjectId.isValid(store_id)) {
        return Responses.failResponse(res, "Invalid store ID", 400);
      }
      query.store_id = store_id;
    }

    if (product_id) {
      if (!mongoose.Types.ObjectId.isValid(product_id)) {
        return Responses.failResponse(res, "Invalid product ID", 400);
      }
      query.product_id = product_id;
    }

    const inventory = await Inventory.find(query).populate("product_id", "name brand");

    if (!inventory || inventory.length === 0) {
      return Responses.failResponse(res, "No inventory records found", 404);
    }

    return Responses.successResponse(res, "Inventory records fetched successfully", 200, inventory);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Deletes an inventory record
 * @param {import("express").Request} req - The request object containing inventory ID in the URL params
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response confirming the deletion
 */
export const deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    // Validate inventoryId
    if (!inventoryId || !mongoose.Types.ObjectId.isValid(inventoryId)) {
      return Responses.failResponse(res, "Invalid inventory ID", 400);
    }

    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!deletedInventory) {
      return Responses.failResponse(res, "Inventory record not found or deletion failed", 404);
    }

    return Responses.successResponse(res, "Inventory record deleted successfully", 200, deletedInventory);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};