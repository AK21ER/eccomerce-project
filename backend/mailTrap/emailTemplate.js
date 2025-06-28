export const purchase_verification=`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Order Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; }
    h2 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Order from {username}</h2>
    <p>Customer email: {useremail}</p>
    <p>Order details:</p>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {productRows}
      </tbody>
    </table>
    <p> the total price to be payed will be : {totalmoney} </p>
    <p>Check the admin dashboard for more info.</p>
    <p>Regards,<br>Your E-commerce System</p>
  </div>
</body>
</html>


`