const mongoose = require('mongoose');
const { Schema } = mongoose;
const settings = require('../../settings.json');
const merge = require('lodash.merge');

mongoose.connect(settings.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const UserConfig = mongoose.model(
	'userConfig',
	new Schema({
		_id: String,
		analysis: {
			enabled: Boolean,
			mention: Boolean,
			format: String,
			preset: String,
			presets: {
				standart: {
					showNumbers: Boolean,
					showGen: Boolean,
					showSeries: Boolean,
				},
				custom: {
					format: String,
				},
			},
		},
		reminders: {
			drop: Schema.Types.Mixed,
			grab: Schema.Types.Mixed,
			raid: Schema.Types.Mixed,
		},
		utils: {
			glowIndicators: Schema.Types.Mixed,
		},
	}),
);

const serverConfigObject = {
	analysis: {
		enabled: { type: Boolean, default: true },
		mention: { type: Boolean, default: true },
		format: {
			type: String,
			default: '`1]` • :heart: `{wl1}` • `ɢ{gen1}` • **{cardname1}** • {cardseries1}\n{copy1?2}\n{copy1?3}',
		},
		preset: { type: String, default: 'standart' },
		presets: {
			standart: {
				showNumbers: { type: Boolean, default: true },
				showGen: { type: Boolean, default: true },
				showSeries: { type: Boolean, default: true },
			},
			custom: {
				format: {
					type: String,
					default: '`1]` • :heart: `{wl1}` • `ɢ{gen1}` • **{cardname1}** • {cardseries1}\n{copy1?2}\n{copy1?3}',
				},
			},
		},
	},
	utils: {
		deleteMessage: { type: Boolean, default: false },
		glowIndicators: { type: Schema.Types.Mixed, default: true },
	},
	reminders: {
		drop: { type: Schema.Types.Mixed, default: true },
		grab: { type: Schema.Types.Mixed, default: false },
		raid: { type: Schema.Types.Mixed, default: false },
	},
	serverDrops: {
		captcha: {
			enabled: { type: Boolean, default: true },
			format: { type: String, default: '`1]` • :heart: `{wl1}` • `ɢ{gen1}` • **{cardname1}** • {cardseries1}' },
		},
		series: {
			one: {
				enabled: { type: Boolean, default: true },
				format: { type: String, default: '`1]` • :heart: `{wl1}` • {cardseries1}\n{copy1?2}\n{copy1?3}' },
			},
			two: {
				enabled: { type: Boolean, default: true },
				format: {
					type: String,
					default: '`1]` • :heart: `{wl1}` • `ɢ{gen1}` • **{cardname1}** • {cardseries1}\n{copy1?2}',
				},
			},
		},
		minigame: {
			enabled: { type: Boolean, default: true },
			format: { type: String, default: '`1]` • :heart: `{wl1}` • **{cardname1}** • {cardseries1}' },
		},
	},
};

const ServerConfig = mongoose.model(
	'serverConfig',
	new Schema({
		_id: String,
		...serverConfigObject,
	}),
);

let serverConfigDefaults = convertServerDefaults(serverConfigObject);

async function setData(id, query, data, isServer, operation) {
	await (isServer ? ServerConfig : UserConfig)
		.findByIdAndUpdate(
			id,
			{
				[operation || '$set']: {
					[query]: data,
				},
			},
			{ upsert: true },
		)
		.exec();
}

async function getUserConfig(query, userId, guildId, isServer = false) {
	if (isServer) return await getServerConfig(query, guildId);
	let userConfigResponse = await UserConfig.findById(userId, query === '_all' ? null : query)
		.lean()
		.exec();
	if (userConfigResponse == null) {
		return getServerConfig(query, guildId);
	}
	if (query == '_all') {
		return completeNonexistend(userConfigResponse, query, guildId);
	} else {
		if (userConfigResponse[query.split('.')[0]] == null) {
			userConfigResponse = getServerConfig(query, guildId);
		}
		query.split('.').forEach((key) => {
			userConfigResponse = userConfigResponse?.[key];
		});
		if (userConfigResponse == null) return getServerConfig(query, guildId);
		return completeNonexistend(userConfigResponse, query, guildId);
	}
}

async function getServerConfig(query, guildId) {
	let serverConfigResponse;
	if (query == '_all') {
		serverConfigResponse = (await ServerConfig.findById(guildId).lean().exec()) ?? serverConfigDefaults;
		return convertDefaulted(serverConfigResponse, true);
	} else {
		serverConfigResponse = (await ServerConfig.findById(guildId, query).lean().exec()) ?? serverConfigDefaults;
		serverConfigResponse = sServer(serverConfigResponse, query);
		return merge(
			convertDefaulted(sServer(serverConfigDefaults, query), true),
			convertDefaulted(serverConfigResponse, true),
		);
	}
}

function sServer(serverConfigResponse, query) {
	if (serverConfigResponse[query.split('.')[0]] == null) {
		serverConfigResponse = serverConfigDefaults;
	}
	query.split('.').forEach((key) => {
		serverConfigResponse = serverConfigResponse[key];
	});
	return serverConfigResponse;
}

async function completeNonexistend(userConfigResponse, query, guildId) {
	let serverConfigResponse = await getServerConfig(query, guildId);
	return merge(serverConfigResponse, convertDefaulted(userConfigResponse, false));
}

function convertDefaulted(obj, serverDefault) {
	const converted = {};
	if (typeof obj !== 'object') {
		return {
			data: obj,
			serverDefault: serverDefault,
		};
	}
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'object') {
			if (value.data || value.serverDefault) converted[key] = value;
			else converted[key] = convertDefaulted(value, serverDefault);
		} else {
			converted[key] = {
				data: value,
				serverDefault: serverDefault,
			};
		}
	}
	return converted;
}

function convertServerDefaults(obj) {
	let converted = {};
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'object') {
			if (value.type && value.default !== undefined) {
				converted[key] = value.default;
			} else converted[key] = convertServerDefaults(value);
		}
	}
	return converted;
}

module.exports = {
	UserConfig,
	ServerConfig,
	setData,
	getUserConfig,
	getServerConfig,
	convertDefaulted,
	convertServerDefaults,
};
