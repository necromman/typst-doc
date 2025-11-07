import { Item } from './Item';

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export class Inventory {
  private slots: InventorySlot[];
  maxSlots: number;

  constructor(maxSlots: number = 20) {
    this.slots = [];
    this.maxSlots = maxSlots;
  }

  addItem(item: Item, quantity: number = 1): boolean {
    // 같은 아이템이 이미 있는지 확인
    const existingSlot = this.slots.find(slot => slot.item.id === item.id);

    if (existingSlot) {
      existingSlot.quantity += quantity;
      return true;
    }

    // 빈 슬롯이 있는지 확인
    if (this.slots.length < this.maxSlots) {
      this.slots.push({ item, quantity });
      return true;
    }

    return false; // 인벤토리가 가득 참
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const slotIndex = this.slots.findIndex(slot => slot.item.id === itemId);
    if (slotIndex === -1) return false;

    const slot = this.slots[slotIndex];
    if (slot.quantity < quantity) return false;

    slot.quantity -= quantity;
    if (slot.quantity === 0) {
      this.slots.splice(slotIndex, 1);
    }

    return true;
  }

  getItem(itemId: string): InventorySlot | undefined {
    return this.slots.find(slot => slot.item.id === itemId);
  }

  getItems(): InventorySlot[] {
    return [...this.slots];
  }

  hasSpace(): boolean {
    return this.slots.length < this.maxSlots;
  }

  toJSON() {
    return {
      slots: this.slots,
      maxSlots: this.maxSlots
    };
  }
}
