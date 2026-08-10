/** @odoo-module **/
const { Component, useState } = owl;

const FAMILY_LABELS = {
    floral: 'Floral', oriental: 'Oriental', woody: 'Amaderado',
    fresh: 'Fresco / Cítrico', fougere: 'Fougère', chypre: 'Chypre',
    gourmand: 'Gourmand', aquatic: 'Acuático', aromatic: 'Aromático',
};

export class ProductDetail extends Component {
    static template = 'scentsync.ProductDetail';
    static props = ['product', 'onBack', 'onAddToCart'];

    setup() {
        this.state = useState({ qty: 1 });
    }

    getFamilyLabel(value) { return FAMILY_LABELS[value] || value; }
    formatPrice(price) { return parseFloat(price).toFixed(2); }
    incQty() { this.state.qty++; }
    decQty() { if (this.state.qty > 1) this.state.qty--; }

    async onAddToCart() {
        await this.props.onAddToCart(this.props.product.id, this.state.qty);
    }
}
