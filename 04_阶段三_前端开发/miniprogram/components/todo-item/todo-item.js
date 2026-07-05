// components/todo-item/todo-item.js
Component({
  properties: {
    item: { type: Object, value: {} }
  },
  data: {
    PRIORITY: { 0: '无', 1: '较低', 2: '中等', 3: '紧急' }
  },
  methods: {
    onTap()    { this.triggerEvent('detail', { id: this.data.item.id }); },
    onToggle() {
      this.triggerEvent('toggle', {
        id: this.data.item.id,
        completed: this.data.item.is_completed
      });
    }
  }
});
