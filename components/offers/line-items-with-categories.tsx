"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface LineItem {
  position: number;
  description: string;
  quantity?: number;
  unit?: string;
  priceHT: number;
  tvaRate: number;
  category?: string;
  sectionOrder?: number;
}

interface Category {
  name: string;
  order: number;
  expanded: boolean;
}

interface LineItemsWithCategoriesProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  currency: string;
  tvaRate: number;
}

export function LineItemsWithCategories({
  lineItems,
  onLineItemsChange,
  currency,
  tvaRate,
}: LineItemsWithCategoriesProps) {
  // Extract unique categories from line items
  const extractCategories = (): Category[] => {
    const categoryMap = new Map<string, { order: number }>();
    lineItems.forEach((item) => {
      if (item.category) {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, {
            order: item.sectionOrder ?? 999,
          });
        }
      }
    });

    const categories: Category[] = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        order: data.order,
        expanded: true,
      }))
      .sort((a, b) => a.order - b.order);

    return categories;
  };

  const [categories, setCategories] = useState<Category[]>(extractCategories());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [tempCategoryName, setTempCategoryName] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Group line items by category
  const getItemsByCategory = (categoryName: string) => {
    return lineItems.filter((item) => item.category === categoryName);
  };

  const getUncategorizedItems = () => {
    return lineItems.filter((item) => !item.category);
  };

  const calculateSubtotal = (items: LineItem[]) => {
    return items.reduce((sum, item) => {
      const qty = typeof item.quantity === "number" ? item.quantity : 1;
      return sum + item.priceHT * qty;
    }, 0);
  };

  // Add a new category
  const addCategory = () => {
    setIsAddingCategory(true);
    setTempCategoryName("");
  };

  const confirmAddCategory = () => {
    if (!tempCategoryName.trim()) return;

    const newOrder = categories.length;
    setCategories([
      ...categories,
      { name: tempCategoryName.trim(), order: newOrder, expanded: true },
    ]);
    setIsAddingCategory(false);
    setTempCategoryName("");
  };

  const cancelAddCategory = () => {
    setIsAddingCategory(false);
    setTempCategoryName("");
  };

  // Rename a category
  const startRenameCategory = (oldName: string) => {
    setEditingCategory(oldName);
    setNewCategoryName(oldName);
  };

  const confirmRenameCategory = (oldName: string) => {
    if (!newCategoryName.trim()) return;

    // Update categories list
    setCategories(
      categories.map((cat) =>
        cat.name === oldName ? { ...cat, name: newCategoryName.trim() } : cat
      )
    );

    // Update all line items with this category
    const updatedItems = lineItems.map((item) =>
      item.category === oldName
        ? { ...item, category: newCategoryName.trim() }
        : item
    );
    onLineItemsChange(updatedItems);

    setEditingCategory(null);
    setNewCategoryName("");
  };

  const cancelRenameCategory = () => {
    setEditingCategory(null);
    setNewCategoryName("");
  };

  // Delete a category (moves items to uncategorized)
  const deleteCategory = (categoryName: string) => {
    if (
      !confirm(
        `Supprimer la catégorie "${categoryName}" ? Les positions seront conservées sans catégorie.`
      )
    ) {
      return;
    }

    setCategories(categories.filter((cat) => cat.name !== categoryName));

    const updatedItems = lineItems.map((item) =>
      item.category === categoryName
        ? { ...item, category: undefined, sectionOrder: undefined }
        : item
    );
    onLineItemsChange(updatedItems);
  };

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setCategories(
      categories.map((cat) =>
        cat.name === categoryName ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  // Add line item to a specific category
  const addLineItem = (categoryName?: string) => {
    const newPosition = lineItems.length + 1;
    const category = categoryName
      ? categories.find((c) => c.name === categoryName)
      : undefined;

    const newItem: LineItem = {
      position: newPosition,
      description: "",
      quantity: 1,
      unit: "",
      priceHT: 0,
      tvaRate,
      category: categoryName,
      sectionOrder: category?.order,
    };

    onLineItemsChange([...lineItems, newItem]);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    const reindexed = updated.map((item, i) => ({ ...item, position: i + 1 }));
    onLineItemsChange(reindexed);
  };

  // Update line item
  const updateLineItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    onLineItemsChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addCategory}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => addLineItem()}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une position
        </Button>
      </div>

      {/* New category input */}
      {isAddingCategory && (
        <div className="border-2 border-artisan-yellow rounded-lg p-4 bg-artisan-yellow/5">
          <div className="flex items-center gap-2">
            <Input
              value={tempCategoryName}
              onChange={(e) => setTempCategoryName(e.target.value)}
              placeholder="Nom de la catégorie (ex: Main d'œuvre, Matériaux...)"
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmAddCategory();
                }
                if (e.key === "Escape") {
                  cancelAddCategory();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={confirmAddCategory}
              disabled={!tempCategoryName.trim()}
            >
              <Check className="w-4 h-4 mr-1" />
              Créer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={cancelAddCategory}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.map((category) => {
        const items = getItemsByCategory(category.name);
        const subtotal = calculateSubtotal(items);

        return (
          <div
            key={category.name}
            className="border-2 border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Category header */}
            <div className="bg-artisan-yellow/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className="hover:bg-artisan-yellow/30 rounded p-1"
                >
                  {category.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {editingCategory === category.name ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          confirmRenameCategory(category.name);
                        }
                        if (e.key === "Escape") {
                          cancelRenameCategory();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => confirmRenameCategory(category.name)}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={cancelRenameCategory}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({items.length} position{items.length > 1 ? "s" : ""})
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-deep-green">
                  {formatCurrency(subtotal)}
                </span>
                {editingCategory !== category.name && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startRenameCategory(category.name)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCategory(category.name)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Category items */}
            {category.expanded && (
              <div className="p-3 space-y-2">
                {items.map((item) => {
                  const globalIndex = lineItems.indexOf(item);
                  return (
                    <div
                      key={globalIndex}
                      className="border rounded p-3 bg-sand-light/10 space-y-2"
                    >
                      <div className="flex gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={item.unit || ""}
                              onChange={(e) =>
                                updateLineItem(
                                  globalIndex,
                                  "unit",
                                  e.target.value
                                )
                              }
                              placeholder="Art."
                              className="w-24 text-sm"
                            />
                            <Textarea
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(
                                  globalIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Désignation"
                              rows={1}
                              className="flex-1 text-sm"
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="text"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                updateLineItem(
                                  globalIndex,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="#"
                              className="w-20 text-sm text-center"
                            />
                            <span className="text-sm">×</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.priceHT}
                              onChange={(e) =>
                                updateLineItem(
                                  globalIndex,
                                  "priceHT",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                              className="w-32 text-sm"
                            />
                            <span className="text-sm font-semibold min-w-[100px] text-right">
                              {typeof item.quantity === "number"
                                ? formatCurrency(item.priceHT * item.quantity)
                                : "—"}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeLineItem(globalIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addLineItem(category.name)}
                  className="w-full border-2 border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une position dans {category.name}
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized items */}
      {getUncategorizedItems().length > 0 && (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3">
            <span className="font-bold text-sm">Sans catégorie</span>
          </div>
          <div className="p-3 space-y-2">
            {getUncategorizedItems().map((item) => {
              const globalIndex = lineItems.indexOf(item);
              return (
                <div
                  key={globalIndex}
                  className="border rounded p-3 bg-sand-light/10 space-y-2"
                >
                  <div className="flex gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-2" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={item.unit || ""}
                          onChange={(e) =>
                            updateLineItem(globalIndex, "unit", e.target.value)
                          }
                          placeholder="Art."
                          className="w-24 text-sm"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(
                              globalIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Désignation"
                          rows={1}
                          className="flex-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateLineItem(
                              globalIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="#"
                          className="w-20 text-sm text-center"
                        />
                        <span className="text-sm">×</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.priceHT}
                          onChange={(e) =>
                            updateLineItem(
                              globalIndex,
                              "priceHT",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          className="w-32 text-sm"
                        />
                        <span className="text-sm font-semibold min-w-[100px] text-right">
                          {typeof item.quantity === "number"
                            ? formatCurrency(item.priceHT * item.quantity)
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLineItem(globalIndex)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lineItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune position ajoutée</p>
          <p className="text-sm">
            Commencez par créer une catégorie ou ajouter une position
          </p>
        </div>
      )}
    </div>
  );
}
