console.time('app')
require('dotenv').config()
require('events').EventEmitter.prototype._maxListeners = 100
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOGGER: 'file' | 'console'
      LEVELS: string
    }
  }
}

const prompt = require('prompt-sync')({ sigint: true })

import request, { Response } from 'request'
import logger from './util/logger'
import puppeteer from 'puppeteer'
import fs from 'fs'
import { Postgres } from './db/postgres'
import { getConnection } from 'typeorm'
import { exit } from 'process'
import { Profile } from './entity/Profile'

const accGathering = (rootAccountId: string | number) => {
  return new Promise((res, rej) => {
    const uri = `https://i.instagram.com/api/v1/friendships/${rootAccountId}/followers/?count=10000&search_surface=follow_list_page`

    request.get(
      uri,
      {
        headers: {
          'x-ig-app-id': '936619743392459',
          cookie: `mid=Yb39fgALAAGKPQP6z2VSwM4f_dQr; ig_did=5F50D6E9-2834-46DC-B568-623C0D39B4CC; csrftoken=h7PvuwU6J8PS5qRIaOY0tw0X92CVGScj; ds_user_id=9150005397; sessionid=9150005397%3ALaAqYW566XHVnH%3A29; shbid="1198305491500053970541673864827:01f7fdf2fbb2f44528bf1a139ba9939d0a95ca5f17dd87a4374bb3531d0d7afbc439e952"; shbts="164232882705491500053970541673864827:01f71f3736f6c7535db3e87b054240eb83b25f0c17de90ce18301d33c22d7b48b906670c"; rur="LDC05491500053970541673871295:01f7e4dc104833743c31dc420419b73d2395c52839cf3c8b787e95ed041f66bf55032903"`,
        },
      },
      (err, resp) => {
        if (err) {
          rej(err)
        } else {
          res(resp)
        }
      }
    )
  })
}

const progress = (resp: unknown, level = 0) => {
  const Profiles: Profile[] = []
  //@ts-ignore
  JSON.parse(resp.body).users.forEach((it) => {
    Profiles.push(new Profile({ ...it, level, discovered: true }))
  })

  return Profiles
}

const save = (Profiles: Profile[]) => getConnection().getRepository(Profile).save(Profiles)

const cPostgres = new Postgres(logger)
cPostgres.connect([Profile]).then(async (res) => {
  accGathering(9150005397)
    .then((res) => save(progress(res, 0)))
    .then(async (result) => {
      logger.info('entered leveling ' + result)
      for (let i = 0; i < Number(process.env.LEVELS); i++) {
        const res = await getConnection()
          .getRepository(Profile)
          .find({ where: { level: i } })

        const Profiles: Profile[] = []

        await Promise.all(res.map((it) => accGathering(it.pk).then((res) => Profiles.push(...progress(res, i + 1)))))

        const pks = (
          await getConnection()
            .getRepository(Profile)
            .find({ select: ['pk'] })
        ).map((it) => it.pk)

        Profiles.filter((v, i, a) => a.findIndex((t) => t.pk === v.pk) === i || pks.includes(v.pk))
      }
    })

  // const browser = await puppeteer.launch({ headless: false })
  // const page = await browser.newPage()
  // await page.goto(process.env.START)
  // await page.waitForNavigation()
  // const readyToStart = prompt('continue press 1 ') === 1
  // const [button] = await page.$x("//span[contains(text(), ' followers')]")
  // await button.click()
  // await new Promise((res, rej) => {
  //   setTimeout(res, 2000)
  // })
  // await browser.close()
})

// First fill database with data from this: https://i.instagram.com/api/v1/friendships/6495010860/followers/?count=1000&search_surface=follow_list_page

// Then fetch 100 user from the database, foreach dem and merge bio to the database

// get Bio from xpath from user with puppeteer
// https://stackoverflow.com/a/63520876/11123801
