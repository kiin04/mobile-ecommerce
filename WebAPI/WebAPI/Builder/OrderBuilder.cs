using System;

namespace WebAPI.Models
{
    public class OrderBuilder
    {
        private readonly Order _order;

        public OrderBuilder()
        {
            _order = new Order();
        }

        public OrderBuilder WithUserId(int userId)
        {
            _order.UserId = userId;
            return this;
        }

        public OrderBuilder WithTotalPrice(decimal totalPrice)
        {
            _order.TotalPrice = totalPrice;
            return this;
        }

        public OrderBuilder WithStatus(string? status)
        {
            _order.Status = status;
            return this;
        }

        public OrderBuilder WithName(string? name)
        {
            _order.Name = name;
            return this;
        }

        public OrderBuilder WithPaymentMethod(string? paymentMethod)
        {
            _order.PaymentMethod = paymentMethod;
            return this;
        }

        public OrderBuilder WithPaymentStatus(string? paymentStatus)
        {
            _order.PaymentStatus = paymentStatus;
            return this;
        }

        public OrderBuilder WithCancellationReason(string? cancellationReason)
        {
            _order.CancellationReason = cancellationReason;
            return this;
        }

        public OrderBuilder WithNote(string? note)
        {
            _order.Note = note;
            return this;
        }

        public OrderBuilder WithPhone(string? phone)
        {
            _order.Phone = phone;
            return this;
        }

        public OrderBuilder WithAddress(string? address)
        {
            _order.Address = address;
            return this;
        }

        public Order Build()
        {
            return _order;
        }
    }
}
