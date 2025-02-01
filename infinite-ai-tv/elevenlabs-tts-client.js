const fetch = require("node-fetch");
const { hash, streamToBase64String } = require("./utils");

module.exports = class ElevenLabsTTS {
  constructor() {
    this.modelId = "eleven_multilingual_v2"; // double check the voices available match to the model specified
  }

  /**
   * Uses ElevenLabs Text-to-Speech to synthesize audio from text.
   * 
   * This endpoint returns MP3 bytes.
   * 
   * @param {string} message text to synthesize
   * @param {string} voiceId https://elevenlabs.io/docs/api-reference/voices/get-all
   * @param {object} options https://elevenlabs.io/docs/api-reference/text-to-speech/convert
   * @returns promoise that returns base64 encoded audiocontent or null
   */
  async textToSpeech(message, voiceId = process.env.ELEVENLABS_VOICE_ID, options = {}) {
    // https://uberduck.readme.io/reference/generate_speech_synchronously_speak_synchronous_post
    const requestUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    const postData = {
      model_id: this.modelId,
      text: message,
      ...options,
    };
    console.re.log(`elevenlabs:textToSpeech> ${requestUrl} > ${JSON.stringify(postData)}`);
    return fetch(requestUrl, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_SECRET,
      },
    }).then((response) => {
      return streamToBase64String(response.body);
    }).catch((ex) => {
      console.re.error(
        `elevenlabs:textToSpeech> error ${ex.name}: ${ex.message}`
      );
      if (ex.response) {
        console.re.error(ex.response.data);
      } else {
        console.re.error(ex.stack);
      }
      return "";
    });
  }

  voices =  [
    {
      "voice_id": "9BWtsMINqrJLrRacOk9x",
      "name": "Aria",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "expressive",
        "age": "middle-aged",
        "gender": "female",
        "use_case": "social media"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/9BWtsMINqrJLrRacOk9x/405766b8-1f4e-4d3c-aba1-6f25333823ec.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "CwhRBWXzGAHq8TQ4Fs17",
      "name": "Roger",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "failed",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "confident",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "social media"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "EXAVITQu4vr4xnSDxMaL",
      "name": "Sarah",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {},
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {},
        "message": {},
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "american",
        "description": "soft",
        "age": "young",
        "gender": "female",
        "use_case": "news"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_turbo_v2",
        "eleven_multilingual_v2",
        "eleven_turbo_v2_5"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "FGY2WhTYpPnrIDTdsKH5",
      "name": "Laura",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "upbeat",
        "age": "young",
        "gender": "female",
        "use_case": "social media"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "IKne3meq5aSn9XLyUdCD",
      "name": "Charlie",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "Australian",
        "description": "natural",
        "age": "middle aged",
        "gender": "male",
        "use_case": "conversational"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "JBFqnCBsd6RMkjVDRZzb",
      "name": "George",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_turbo_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_v2_flash": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_turbo_v2": "",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "British",
        "description": "warm",
        "age": "middle aged",
        "gender": "male",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "N2lVS1w4EtoT3dr4eOWO",
      "name": "Callum",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "Transatlantic",
        "description": "intense",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "characters"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "SAz9YHcvj6GT2YYXdXww",
      "name": "River",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_multilingual_sts_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "confident",
        "age": "middle-aged",
        "gender": "non-binary",
        "use_case": "social media"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e6c95f0b-2227-491a-b3d7-2249240decb7.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_sts_v2",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "TX3LPaxmHKxFdv7VOQHJ",
      "name": "Liam",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_turbo_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_v2_flash": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_turbo_v2": "",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "articulate",
        "age": "young",
        "gender": "male",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "XB0fDUnXU5powFXDhCwa",
      "name": "Charlotte",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_multilingual_v2": "",
          "eleven_turbo_v2_5": "",
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "Swedish",
        "description": "seductive",
        "age": "young",
        "gender": "female",
        "use_case": "characters"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bda5-4f8505ee038b.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "Xb7hH8MSUJpSbSDYk0k2",
      "name": "Alice",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "British",
        "description": "confident",
        "age": "middle-aged",
        "gender": "female",
        "use_case": "news"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "XrExE9yKIg1WjnnlVkGX",
      "name": "Matilda",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_turbo_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_v2_flash": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_turbo_v2": "",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "friendly",
        "age": "middle-aged",
        "gender": "female",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "bIHbv24MWmeRgasZH58o",
      "name": "Will",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "friendly",
        "age": "young",
        "gender": "male",
        "use_case": "social media"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "cgSgspJ2msm6clMCkdW9",
      "name": "Jessica",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "expressive",
        "age": "young",
        "gender": "female",
        "use_case": "conversational"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "cjVigY5qzO86Huf0OWal",
      "name": "Eric",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_multilingual_v2": "fine_tuned",
          "eleven_turbo_v2_5": "fine_tuned",
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_flash_v2": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "friendly",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "conversational"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "iP95p4xoKVk53GoZ742B",
      "name": "Chris",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "casual",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "conversational"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "nPczCjzI2devNBz1zQrb",
      "name": "Brian",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "deep",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "onwK4e9ZLuTAKqWW03F9",
      "name": "Daniel",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "British",
        "description": "authoritative",
        "age": "middle-aged",
        "gender": "male",
        "use_case": "news"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_multilingual_v1",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "pFZP5JQG7iQjIQuC4Bku",
      "name": "Lily",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "British",
        "description": "warm",
        "age": "middle-aged",
        "gender": "female",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    },
    {
      "voice_id": "pqHfZKP75CvOlQylNhV4",
      "name": "Bill",
      "samples": null,
      "category": "premade",
      "fine_tuning": {
        "is_allowed_to_fine_tune": true,
        "state": {
          "eleven_flash_v2_5": "fine_tuned",
          "eleven_turbo_v2": "fine_tuned",
          "eleven_flash_v2": "fine_tuned",
          "eleven_v2_flash": "fine_tuned",
          "eleven_v2_5_flash": "fine_tuned"
        },
        "verification_failures": [],
        "verification_attempts_count": 0,
        "manual_verification_requested": false,
        "language": "en",
        "progress": {
          "eleven_flash_v2_5": 1,
          "eleven_v2_flash": 1,
          "eleven_flash_v2": 1,
          "eleven_v2_5_flash": 1
        },
        "message": {
          "eleven_flash_v2_5": "Done!",
          "eleven_turbo_v2": "",
          "eleven_flash_v2": "Done!",
          "eleven_v2_flash": "Done!",
          "eleven_v2_5_flash": "Done!"
        },
        "dataset_duration_seconds": null,
        "verification_attempts": null,
        "slice_ids": null,
        "manual_verification": null,
        "max_verification_attempts": 5,
        "next_max_verification_attempts_reset_unix_ms": 1700000000000
      },
      "labels": {
        "accent": "American",
        "description": "trustworthy",
        "age": "old",
        "gender": "male",
        "use_case": "narration"
      },
      "description": null,
      "preview_url": "https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3",
      "available_for_tiers": [],
      "settings": null,
      "sharing": null,
      "high_quality_base_model_ids": [
        "eleven_v2_flash",
        "eleven_flash_v2",
        "eleven_turbo_v2_5",
        "eleven_multilingual_v2",
        "eleven_v2_5_flash",
        "eleven_flash_v2_5",
        "eleven_turbo_v2"
      ],
      "safety_control": null,
      "voice_verification": {
        "requires_verification": false,
        "is_verified": false,
        "verification_failures": [],
        "verification_attempts_count": 0,
        "language": null,
        "verification_attempts": null
      },
      "permission_on_resource": null,
      "is_owner": false,
      "is_legacy": false,
      "is_mixed": false,
      "created_at_unix": null
    }
  ];

  /**
   * From provided list of voices, return a random voice.
   * @returns a random Elevanlabs text-to-speech voice
   */
  getRandomVoice() {
    return this.voices[Math.floor(Math.random() * this.voices.length)];
  }

  getVoice(name) {
    return this.voices[Math.abs(hash(name)) % this.voices.length];
  }

  /**
   * Get a random pitch value for text-to-speech voice.
   * @returns a random double between -20.0 (inclusive) and 20.0 (exclusive)
   */
  getRandomPitch() {
    return Math.random() * 40.0 - 20.0;
  }
};
