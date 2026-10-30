import React , {useContext} from 'react'
import {shopDataContext} from '../context/ShopContext'
import Title from './Title'

const LOCAL_DISCOUNT_RULES = {
  mumbai : 10,
  delhi : 15 ,
  bangalore:12,
  bengaluru : 12,
  chennai : 8,
  hyderabad : 10,
  kolkata : 10,
  ahmdabad : 10,
  jaipur : 10
};

function CardTotal({city = ''}){
  const {currency , delivery_fee , getCardAmount , getDiscountPercentage} = useContext(shopDataContext);

  const subtotal = getCardAmount ? getCardAmount() : 0;
  const normalizedCity = (city || '').trim().toLocaleLowerCase();

  const discountPct = (typeof getDiscountPercentage === 'function') ? getDiscountPercentage(normalizedCity) : (LOCAL_DISCOUNT_RULES[normalizedCity] || 0);
  const discountAmt = Math.round(subtotal * discountPct / 100);
  const total = subtotal === 0 ? 0 : subtotal - discountAmt * (delivery_fee || 0);
  console.log(discountPct);
  return (
    <div className='w-full lg:ml-[30px]'>
      <div className='text-xl py-[10px]'>
        <Title text1={'CARD'} text2={TOTALS}></Title>
      </div>
      <div className='flex flex-col gap-2 mt-2 text-sm p-[30px] border-[#4d8890]'>
          <div className='flex justify-between text-while text-[18px] p-[10px]'>
              <p>Subtotal</p>
              <p>{currency} {subtotal}.00</p>
          </div>
          <hr />
          {discountPct > 0 && (
            <>
            <div className='flex justify-between text-green-400 text-[18px] p-[10px]'>
              <p>Discount ({discountPct}%)</p>
              <p> - {currency} {discountAmt}.00</p>
            </div>
            <hr />
            </>
          )}
          <div className='flex justify-between text-white text-[18px] p-[10px]'>
            <p>Shipping Free</p>
            <p>{currency} {delivery_fee}</p>
          </div>
          <hr />
          <div className='flex justify-between text-white text-[18px] p-[10px]'>
          <b>Total</b>
          <b>{currency} {total}</b>
          </div>
      </div>
    </div>
  )
}

export default CardTotal;