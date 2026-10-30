import React, { useContext, useState } from 'react'
import Title from '../component/Title'
import CartTotal from '../component/CartTotal'
import razorpay from '../assets/Razorpay.jpg'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'

const CITY_DISCOUNT_RULES = {
  mumbai: 10,
  delhi: 15,
  bangalore: 12,
  bengaluru: 12,
  chennai: 8,
  hyderabad: 10,
  kolkata: 10,
  ahmdabad: 10,
  jaipur: 10
}

function PlaceOrder() {
  let [method, setMethod] = useState('cod')
  let navigate = useNavigate()
  const { cartItem, setCartItem, getCartAmount, delivery_fee, products,currency, getDiscountPercentage, discountRules = {} } = useContext(shopDataContext)

  let { serverUrl } = useContext(authDataContext)
  let [loading, setLoading] = useState(false)

  let [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    country: '',
    phone: ''
  })

  const currentCityKey = (formData.city || '').trim().toLowerCase();
  const activeDiscountPct = (typeof getDiscountPercentage == 'function') ? getDiscountPercentage(currentCityKey) : (CITY_DISCOUNT_RULES[currentCityKey] || 0);
  const displayRules = (discountRules && Object.keys(discountRules).length > 0) ? discountRules : CITY_DISCOUNT_RULES;

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(data => ({ ...data, [name]: value }))
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response)
        const { data } = await axios.post(serverUrl + '/api/order/verifyrazorpay', response, { withCredentials: true })
        if (data) {
          navigate("/order")
          setCartItem({})

        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }


  const onSubmitHandler = async (e) => {

    setLoading(true)
    e.preventDefault()
    try {
      let orderItems = []
      for (const items in cartItem) {
        for (const item in cartItem[items]) {
          if (cartItem[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItem[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }

      const subtotal = getCartAmount();
      const discountPct = (typeof getDiscountPercentage === 'function') ? getDiscountPercentage(formData.city) : 0;
      const discountAmt = Math.round(subtotal * discountPct / 100);
      const discountedTotal = subtotal === 0 ? 0 : subtotal - discountAmt + delivery_fee;
      let orderData = {
        address: formData,
        items: orderItems,
        amount: discountedTotal
      }
      switch (method) {
        case 'cod':

          const result = await axios.post(serverUrl + "/api/order/placeorder", orderData, { withCredentials: true })
          console.log(result.data)
          if (result.data) {
            setCartItem({})
            toast.success("Order Placed")
            navigate("/order")
            setLoading(false)

          } else {
            console.log(result.data.message)
            toast.error("Order Placed Error")
            setLoading(false)
          }

          break;

        case 'razorpay':
          const resultRazorpay = await axios.post(serverUrl + "/api/order/razorpay", orderData, { withCredentials: true })
          if (resultRazorpay.data) {
            initPay(resultRazorpay.data)
            toast.success("Order Placed")
            setLoading(false)
          }

          break;




        default:
          break;

      }


    } catch (error) {
      console.log(error)

    }
  }
  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-center flex-col md:flex-row gap-[50px]  relative'>
      <div className='lg:w-[50%] w-[100%] h-[100%] flex items-center justify-center  lg:mt-[0px] mt-[90px] '>
        <form action="" onSubmit={onSubmitHandler} className='lg:w-[70%] w-[95%] lg:h-[70%] h-[100%]'>
          <div className='py-[10px]'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>
          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>

            <input type="text" placeholder='First name' className='w-[48%] h-[50px] rounded-md bg-slate-700 placeholder:text-[white] text-[18px] px-[20px] shadow-sm shadow-[#343434]' required onChange={onChangeHandler} name='firstName' value={formData.firstName} />

            <input type="text" placeholder='Last name' className='w-[48%] h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='lastName' value={formData.lastName} />
          </div>

          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
            <input type="email" placeholder='Email address' className='w-[100%] h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='email' value={formData.email} />

          </div>
          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
            <input type="text" placeholder='Street' className='w-[100%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='street' value={formData.street} />

          </div>
          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
            <input type="text" placeholder='City' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='city' value={formData.city} />
            <input type="text" placeholder='State' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='state' value={formData.state} />
          </div>

          {
            typeof getDiscountPercentage === 'function' && getDiscountPercentage(formData.city) > 0 && (<>
              <div className='px-[10px] py-[5px]'>
                <p className='text-green-400 text-[14px]'> {getDiscountPercentage(formData.city)} % dicount applied for {formData.city}!</p>
              </div>
            </>)
          }

          <div className='px-[10px] py-[5px]'>
            <details>
              <summary className='text-[#4d8890] hover:text-[#6ab5bf]'>View city-wise discount </summary>
              <div className='mt-[8px] bg-slate-800 rounded-md p-[12px[ border border-[#4d8890]' >
                <table className='w-full text-left text-14px'>
                  <thead>
                    <tr className='text-[#4d8890] border-b border-[#4d8890]'>
                      <th className='pb-[6px]'> City </th>
                      <th className='pb-[6px]'> discount </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(discountRules || {}).map(([ruleCity, pct]) => {
                      const currentCity = (formData.city || '').trim().toLowerCase();
                      return (
                        <tr key={ruleCity} className={`${currentCity === ruleCity.toLowerCase() ? 'text-green-400' : 'text-gray-300'}`}>
                          <th className='pb-[4px] capitalize'> {ruleCity} </th>
                          <th className='pb-[4px]'> {pct} </th>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>


          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
            <input type="text" placeholder='Pincode' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='pinCode' value={formData.pinCode} />
            <input type="text" placeholder='Country' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='country' value={formData.country} />
          </div>
          <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
            <input type="text" placeholder='Phone' className='w-[100%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='phone' value={formData.phone} />

          </div>
          <div>
            <button type='submit' className='text-[18px] active:bg-slate-500 cursor-pointer bg-[#3bcee848] py-[10px] px-[50px] rounded-2xl text-white flex items-center justify-center gap-[20px] absolute lg:right-[20%] bottom-[10%] right-[35%] border-[1px] border-[#80808049] ml-[30px] mt-[20px]' >{loading ? <Loading /> : "PLACE ORDER"}</button>
          </div>


        </form>


      </div>
      <div className='lg:w-[50%] w-[100%] min-h-[100%] flex items-center justify-center gap-[30px] '>
        <div className='lg:w-[70%] w-[90%] lg:h-[70%] h-[100%]  flex items-center justify-center gap-[10px] flex-col'>
          {/* <CartTotal /> */}

          <div className='w-full lg:ml-30px'>
            <div className='text-xl py-[10px]'>
              <Title text1={'CART'} text2={'TOTALS'} />

            </div>
            <div className='flex flex-col gap-2 mt-2 text-sm p-[30px] border-[2px] border-[#4d8890]'>
              <div className='flex justify-between text-white text-[18px] p-[10px]'>
                <p>Subtotal</p>
                <p>{currency} {getCartAmount ? getCartAmount() : 0}.00</p>
              </div>
              <hr />
              {activeDiscountPct > 0 && (
                <>
                  <div className='flex justify-between text-white text-[18px] p-[10px]'>
                    <p>Discount ({activeDiscountPct}%)</p>
                    <p>- {currency} {Math.round(getCartAmount ? getCartAmount() : 0) * activeDiscountPct / 100}.00</p>
                  </div>
                </>)
              }
              <hr />
              <div className='flex justify-between text-white text-[18px] p-[10px]'>
                <p>Shipping Fee</p>
                <p>{currency} {delivery_fee}</p>
              </div>
              <hr />
              <div className='flex justify-between text-white text-[18px] p-[10px]'>
                <b>Total</b>
                <b>
                  {currency} {
                    (getCartAmount ? getCartAmount() : 0) === 0
                      ? 0
                      : (getCartAmount ? getCartAmount() : 0) - Math.round((getCartAmount ? getCartAmount() : 0) * activeDiscountPct / 100) + (delivery_fee || 0)
                  }
                </b>
              </div>
            </div>
          </div>
          <div className='py-[10px]'>
            <Title text1={'PAYMENT'} text2={'METHOD'} />
          </div>
          <div className='w-[100%] h-[30vh] lg:h-[100px] flex items-start mt-[20px] lg:mt-[0px] justify-center gap-[50px]'>
            <button onClick={() => setMethod('razorpay')} className={`w-[150px] h-[50px] rounded-sm  ${method === 'razorpay' ? 'border-[5px] border-blue-900 rounded-sm' : ''}`}> <img src={razorpay} className='w-[100%] h-[100%] object-fill rounded-sm ' alt="" /></button>
            <button onClick={() => setMethod('cod')} className={`w-[200px] h-[50px] bg-gradient-to-t from-[#95b3f8] to-[white] text-[14px] px-[20px] rounded-sm text-[#332f6f] font-bold ${method === 'cod' ? 'border-[5px] border-blue-900 rounded-sm' : ''}`}>CASH ON DELIVERY </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default PlaceOrder
