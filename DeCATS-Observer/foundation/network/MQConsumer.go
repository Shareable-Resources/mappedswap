package network

import (
	"github.com/streadway/amqp"
)

type MQConsumer struct {
	mq *amqp.Channel
}

func (me *MQConsumer) SubscribeTopic(mqUrl string, subscribeTopic string, exchangeMetaData *MQExchangeMetaData,
	taskQueueMetaData *MQTaskQueueMetaData, eventHandler func(message *amqp.Delivery, topic string, contentType string, content []byte)) error {

	conn, err := amqp.Dial(mqUrl)
	if err != nil {
		return err
	}

	me.mq, err = conn.Channel()
	if err != nil {
		return err
	}

	err = me.mq.ExchangeDeclare(
		exchangeMetaData.ExchangeName,
		"topic",
		true,
		exchangeMetaData.IsAutoDelete,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	queue, err := me.mq.QueueDeclare(taskQueueMetaData.QueueName, true, taskQueueMetaData.IsAutoAck, taskQueueMetaData.IsExclusive, false, nil)
	if err != nil {
		return err
	}

	err = me.mq.QueueBind(
		queue.Name,
		subscribeTopic,
		exchangeMetaData.ExchangeName,
		false,
		nil,
	)
	if err != nil {
		return err
	}
	return me.consume(queue.Name, taskQueueMetaData.IsExclusive, taskQueueMetaData.IsAutoAck, eventHandler)
}

func (me *MQConsumer) SubscribeTaskQueue(mqUrl string, taskQueueMetaData *MQTaskQueueMetaData, eventHandler func(message *amqp.Delivery, topic string, contentType string, content []byte)) error {
	conn, err := amqp.Dial(mqUrl)
	if err != nil {
		return err
	}

	me.mq, err = conn.Channel()
	if err != nil {
		return err
	}

	queue, err := me.mq.QueueDeclare(taskQueueMetaData.QueueName, true, taskQueueMetaData.IsAutoDelete, taskQueueMetaData.IsExclusive, false, nil)
	if err != nil {
		return err
	}

	return me.consume(queue.Name, taskQueueMetaData.IsExclusive, taskQueueMetaData.IsAutoAck, eventHandler)
}

func (me *MQConsumer) consume(queueName string, isExclusive bool, isAutoAck bool, eventHandler func(message *amqp.Delivery, topic string, contentType string, content []byte)) error {
	msgs, err := me.mq.Consume(
		queueName,
		"",
		isAutoAck,
		isExclusive,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	go func() {
		for message := range msgs {
			eventHandler(&message, message.RoutingKey, message.ContentType, message.Body)
		}
	}()
	return nil
}
