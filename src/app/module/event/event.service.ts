import { isAfter } from "date-fns";
import httpStatus from "http-status";
import {
	ContractStatus,
	EventStatus,
	Role,
} from "../../../generated/prisma/enums";
import type { EventWhereInput } from "../../../generated/prisma/models";
import type { getEvent } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
	IEventCreate,
	IEventServiceRequirementCreate,
	IEventUpdateServiceRequirement,
	IUpdateEventPayload,
} from "./event.interface";

const createEvent = async (payload: IEventCreate, user: RequestUser) => {
	const existingClient = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const {
		title,
		description,
		eventType,
		city,
		country,
		address,
		startAt,
		endAt,
	} = payload;

	const createdEvent = await prisma.event.create({
		data: {
			title,
			description,
			eventType,
			city,
			country,
			address,
			startAt,
			endAt,
			clientId: existingClient.id,
		},

		include: {
			client: true,
		},
	});

	return createdEvent;
};

const createEventService = async (
	eventId: string,
	payload: IEventServiceRequirementCreate,
	user: RequestUser,
) => {
	const existingClient = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId, clientId: existingClient.id },
		include: {
			serviceRequirements: true,
		},
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	const { serviceName, description, budget, currency, startAt, endAt } =
		payload;

	const createdEventServices = await prisma.eventServiceRequirement.create({
		data: {
			serviceName,
			description,
			budget,
			currency,
			startAt,
			endAt,
			eventId,
		},

		include: {
			event: true,
		},
	});

	return createdEventServices;
};

const getAllPublishedEvents = async (query: getEvent) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: EventWhereInput[] = [
		{
			status: EventStatus.PUBLISHED,
		},
	];

	if (query.clientId) {
		andConditions.push({ clientId: query.clientId });
	}
	if (query.email) {
		andConditions.push({
			client: {
				user: {
					email: query.email,
				},
			},
		});
	}

	if (query.status) {
		andConditions.push({
			serviceRequirements: {
				every: {
					status: query.status,
				},
			},
		});
	}

	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{ title: { contains: query.searchTerm, mode: "insensitive" } },
				{ description: { contains: query.searchTerm, mode: "insensitive" } },
				{ city: { contains: query.searchTerm, mode: "insensitive" } },
				{ country: { contains: query.searchTerm, mode: "insensitive" } },
				{ address: { contains: query.searchTerm, mode: "insensitive" } },

				{
					client: {
						user: {
							OR: [
								{ name: { contains: query.searchTerm, mode: "insensitive" } },
								{ email: { contains: query.searchTerm, mode: "insensitive" } },
							],
						},
					},
				},
			],
		});
	}

	const events = await prisma.event.findMany({
		where: {
			AND: andConditions,
		},

		take: limit,
		skip,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			serviceRequirements: true,
			contracts: {
				include: {
					client: true,
				},
			},
		},
	});

	const total = await prisma.event.count({ where: { AND: andConditions } });

	return {
		data: events,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};
const getEventById = async (eventId: string) => {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
		include: {
			client: {
				select: {
					id: true,
					address: true,
					city: true,
					country: true,
					phone: true,
				},
			},
			serviceRequirements: {
				select: {
					budget: true,
					serviceName: true,
					startAt: true,
					endAt: true,
					description: true,
					status: true,
					currency: true,
				},
				include: {
					contracts: true,
					proposals: true,
				},
			},
			contracts: {
				include: {
					professional: true,
				},
			},
		},
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "event Not Found");
	}

	return event;
};

const updateEvent = async (
	eventId: string,
	payload: IUpdateEventPayload,
	user: RequestUser,
) => {
	// 1. Authenticate client profile
	const client = await prisma.client.findUnique({
		where: { userId: user.userId },
	});

	if (!client) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId, clientId: client.id },
		include: {
			serviceRequirements: true,
		},
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	if (event.status === EventStatus.PUBLISHED) {
		const activeContractsCount = await prisma.contract.count({
			where: {
				eventId: event.id,
				status: { notIn: [ContractStatus.CANCELLED] },
			},
		});

		if (activeContractsCount > 0) {
			throw new AppError(
				httpStatus.CONFLICT,
				"This event has active or pending contracts and cannot be modified.",
			);
		}
	}
	const updatedEvent = await prisma.event.update({
		where: { id: event.id },
		data: {
			title: payload.title ?? event.title,
			description: payload.description ?? event.description,
			eventType: payload.eventType ?? event.eventType,
			address: payload.address ?? event.address,
			city: payload.city ?? event.city,
			country: payload.country ?? event.country,
			startAt: payload.startAt ?? event.startAt,
			endAt: payload.endAt ?? event.endAt,
		},
		include: {
			serviceRequirements: true,
		},
	});

	return updatedEvent;
};

const updateEventService = async (
	eventId: string,
	serviceId: string,
	payload: IEventUpdateServiceRequirement,
	user: RequestUser,
) => {
	const existingClient = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId, clientId: existingClient.id },
		include: {
			serviceRequirements: true,
		},
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	const { serviceName, description, budget, currency, startAt, endAt } =
		payload;

	const updatedEventServices = await prisma.eventServiceRequirement.update({
		where: {
			id: serviceId,
		},
		data: {
			serviceName,
			description,
			budget,
			currency,
			startAt,
			endAt,
			eventId,
		},

		include: {
			event: true,
		},
	});

	return updatedEventServices;
};

const publishEvent = async (eventId: string, user: RequestUser) => {
	const existingClient = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId, clientId: existingClient.id },
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "event Not Found");
	}

	if (event.status === EventStatus.PUBLISHED) {
		throw new AppError(httpStatus.CONFLICT, "event Is Already Published");
	}

	const publishedEvent = await prisma.event.update({
		where: { id: event.id },
		data: { status: EventStatus.PUBLISHED },
	});

	return publishedEvent;
};

const deleteEvent = async (eventId: string, user: RequestUser) => {
	const existingUser = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
	});
	const allowedRoles = new Set<Role>([Role.ADMIN, Role.CLIENT]);

	if (!existingUser || !allowedRoles.has(existingUser.role)) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"You don't have permission to delete",
		);
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId },
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	if (event.status === EventStatus.PUBLISHED) {
		const activeContractsCount = await prisma.contract.count({
			where: {
				eventId: event.id,
				status: { notIn: [ContractStatus.CANCELLED] },
			},
		});

		if (activeContractsCount > 0) {
			throw new AppError(
				httpStatus.CONFLICT,
				"This event has active or pending contracts and cannot be modified.",
			);
		}
	}

	const deletedEvent = await prisma.event.update({
		where: { id: event.id },
		data: { isDeleted: true, deletedAt: new Date() },
	});

	return deletedEvent;
};

const deleteEventService = async (
	eventId: string,
	serviceId: string,
	user: RequestUser,
) => {
	const existingClient = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!existingClient) {
		throw new AppError(httpStatus.NOT_FOUND, "Client Profile Not Found");
	}

	const event = await prisma.event.findUnique({
		where: { id: eventId, clientId: existingClient.id },
		include: {
			serviceRequirements: true,
		},
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event is already deleted");
	}

	const deleteEventService = await prisma.eventServiceRequirement.update({
		where: {
			id: serviceId,
		},
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return deleteEventService;
};

const getEventRequiredServices = async (eventId: string) => {
	const event = await prisma.event.findUnique({
		where: { id: eventId },
	});

	if (!event || event.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Event Not Found");
	}

	if (event.status === EventStatus.DRAFT) {
		throw new AppError(httpStatus.FORBIDDEN, "Event has not published yet");
	}
	if (event.status === EventStatus.CANCELLED) {
		throw new AppError(httpStatus.FORBIDDEN, "Event has been canceled");
	}

	const eventRequiredServices = await prisma.eventServiceRequirement.findMany({
		where: {
			eventId,
		},
		include: {
			contracts: true,
			event: true,
			proposals: true,
		},
	});

	return eventRequiredServices;
};

export const eventService = {
	createEvent,
	createEventService,
	getEventById,
	updateEvent,
	updateEventService,
	publishEvent,
	deleteEvent,
	getAllPublishedEvents,
	deleteEventService,
	getEventRequiredServices,
};
