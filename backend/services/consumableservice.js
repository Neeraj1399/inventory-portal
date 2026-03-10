import Consumable from "../models/Consumable.js";
import AppError from "../utils/appError.js";

/**
 * Pure Logic Helper (Optional: for Unit Testing)
 */
export const checkAvailability = (total, assigned, requested) =>
  total - assigned >= requested;

/**
 * Atomic Stock Service
 */
export async function updateStock(id, quantityRequested) {
  const qty = Number(quantityRequested);

  if (isNaN(qty) || qty <= 0) {
    throw new AppError("Invalid quantity requested", 400);
  }

  const updatedItem = await Consumable.findOneAndUpdate(
    {
      _id: id,
      $expr: {
        $gte: [{ $subtract: ["$totalQuantity", "$assignedQuantity"] }, qty],
      },
    },
    { $inc: { assignedQuantity: qty } },
    {
      new: true,
      runValidators: true,
      select: "itemName totalQuantity assignedQuantity",
    },
  ).lean();

  if (!updatedItem) {
    const exists = await Consumable.exists({ _id: id });
    if (!exists) throw new AppError("Item not found", 404);
    throw new AppError("Insufficient stock to complete this assignment", 400);
  }

  return updatedItem;
}
