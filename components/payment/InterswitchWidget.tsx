"use client";

import { useEffect } from "react";
import { PaymentWidgetParams } from "@/types/payment";

declare global {
    interface Window {
        webpayCheckout: (params: Record<string, unknown>) => void;
    }
}

type Props = {
    params: PaymentWidgetParams
    onClose: () => void;
}

export default function InterswitchWidget({ params, onClose }: Props){
    useEffect(() => {
        const scriptSrc = 
            params.mode === "TEST"
                ? "https://newwebpay-sandbox.interswitchng.com/inline-checkout.js"
                : "https://newwebpay.interswitchng.com/inline-checkout.js";
            
        
        const existingScript = document.getElementById("interswitch-inline");
        if (existingScript){
            // Small delay to ensure any previous modal is cleaned up
            setTimeout(() => triggerPayment(), 100);
            return
        }

        const script = document.createElement("script");
        script.id = "interswitch-inline";
        script.src = scriptSrc;
        script.async = true;
        script.onload = () => {
            // Small delay to ensure script is fully initialized
            setTimeout(() => triggerPayment(), 100);
        };
        script.onerror = () => console.error("Failed to load Interswitch SDK");
        document.body.appendChild(script);

        return () =>{
            const s = document.getElementById("interswitch-inline")
            if (s) document.body.removeChild(s);
        }
         }, [])

         function triggerPayment(){
            if (typeof window.webpayCheckout !== "function"){
                console.error("webpayCheckout not available");
                return;
            }
            
            // Ensure body is scrollable and not blocked
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
            
            window.webpayCheckout({
                merchant_code: params.merchant_code,
                pay_item_id: params.pay_item_id,
                pay_item_name: params.pay_item_name,
                txn_ref: params.txn_ref,
                amount: params.amount,
                currency: params.currency,
                cust_email: params.cust_email,
                cust_name: params.cust_name,
                site_redirect_url: params.site_redirect_url,
                mode: params.mode,
                onComplete: (response: unknown) => console.log("Payment complete:", response),
                onClose: () => onClose(),
            });

         }

         return null;
}