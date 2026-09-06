import React, { useEffect } from 'react';
import { deliveryMarkup } from './page.js';
import { initDelivery } from './client.js';
export default function DeliveryRouter({ operation = 'hub' }) {
  useEffect(() => { initDelivery(); }, [operation]);
  return <><link rel="stylesheet" href={import.meta.env.DEV ? '/src/delivery/router.css' : '/delivery-assets/router.css'} /><div dangerouslySetInnerHTML={{ __html: deliveryMarkup(operation) }} /></>;
}
