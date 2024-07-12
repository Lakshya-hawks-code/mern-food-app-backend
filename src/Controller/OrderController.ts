import { Request, Response } from "express";
import Stripe from "stripe";
import restaurantModel from "../Model/restaurant";
import { MenuItemType } from "../Model/restaurant";
import { url } from "inspector";

const STRIPE = new Stripe(process.env.STRIPE_API_SECRET_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

// Inside session storage item to check

type CheckOutSessionRequest = {
    CartItem: {
        menuItemId: string,
        name: string,
        quantity: string,
    }[];

    deliveryDetails: {
        email: string,
        name: string,
        addressLine1: string,
        city: string,
    }
    restaurantId: string;
}




const createCheckOutSession = async (req: Request, res: Response) => {
 try {
    const checkOutSessionRequest: CheckOutSessionRequest = req.body;

    const restaurant = await restaurantModel.findById(checkOutSessionRequest.restaurantId);

    if (!restaurant) {
        throw new Error("Restaurant not found");
    }

    // Use createLineSession function
    const lineItems = createLineItem(checkOutSessionRequest, restaurant.menuItems);

    // Use createSession function
    const session = await createSession(lineItems, "TEST_Order_Id", restaurant.deliveryPrice, restaurant._id.toString());

    if(!session.url)
    {
        return res.json({
            code : 500,
            message : "Error creating stripe session"
        })
    }

    return res.json
    ({
        code : 200,
        url : session.url
    })

 } catch (error: any) {
    console.error("An error occurred:", error.message);
    return res.status(500).json({
        code: 500,
        message: "An error occurred during create checkout session",
        error: error.message
    });
}
}





// Create Stripe Line Item
const createLineItem = (checkOutSessionRequest: CheckOutSessionRequest, menuItems: MenuItemType[]): Stripe.Checkout.SessionCreateParams.LineItem[] => {
    const lineItems = checkOutSessionRequest.CartItem.map((cartItem) => {
        const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString());

        if (!menuItem) {
            throw new Error(`Menu Item not found: ${cartItem.menuItemId}`);
        }

        const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "gbp",
                unit_amount: menuItem.price,
                product_data: {
                    name: menuItem.name,
                }
            },
              quantity: parseInt(cartItem.quantity),
        };
           
        return lineItem;
    });

    return lineItems;
}


    
// Create Session Function
const createSession = async (
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId: string,
    deliveryPrice: number,
    restaurantId: string
): Promise<Stripe.Checkout.Session> => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {   
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "gbp",
                    }
                }
            } 
        ],
        mode: "payment",
        metadata: {
            orderId,
            restaurantId,
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });
    return sessionData;
}


export default {
    createCheckOutSession
};