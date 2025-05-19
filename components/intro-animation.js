function playIntroAnimation() {
    const t1 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    t1.timeScale(0.8);

    t1.to(plank1.scale, {
        x: 1,
        y: 1,
    })
        .to(
            plank2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            workBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            aboutBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            contactBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        );

    const tFrames = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFrames.timeScale(0.8);

    tFrames
        .to(frame1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            frame2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            frame3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const t2 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    t2.timeScale(0.8);

    t2.to(boba.scale, {
        z: 1,
        y: 1,
        x: 1,
        delay: 0.4,
    })
        .to(
            github.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            youtube.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            twitter.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        );

    const tFlowers = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFlowers.timeScale(0.8);

    tFlowers
        .to(flower5.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            flower4.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower1.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tBoxes = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tBoxes.timeScale(0.8);

    tBoxes
        .to(box1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            box2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            box3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tLamp = gsap.timeline({
        defaults: {
            duration: 0.8,
            delay: 0.2,
            ease: "back.out(1.8)",
        },
    });
    tLamp.timeScale(0.8);

    tLamp.to(lamp.scale, {
        x: 1,
        y: 1,
        z: 1,
    });

    const tSlippers = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tSlippers.timeScale(0.8);

    tSlippers
        .to(slippers1.scale, {
            x: 1,
            y: 1,
            z: 1,
            delay: 0.5,
        })
        .to(
            slippers2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tEggs = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tEggs.timeScale(0.8);

    tEggs
        .to(egg1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            egg2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            egg3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tFish = gsap.timeline({
        defaults: {
            delay: 0.8,
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFish.timeScale(0.8);

    tFish.to(fish.scale, {
        x: 1,
        y: 1,
        z: 1,
    });

    const lettersTl = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.7)",
        },
    });
    lettersTl.timeScale(0.8);

    lettersTl
        .to(letter1.position, {
            y: letter1.userData.initialPosition.y + 0.3,
            duration: 0.4,
            ease: "back.out(1.8)",
            delay: 0.25,
        })
        .to(
            letter1.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter1.position,
            {
                y: letter1.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter2.position,
            {
                y: letter2.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter2.position,
            {
                y: letter2.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter3.position,
            {
                y: letter3.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter3.position,
            {
                y: letter3.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter4.position,
            {
                y: letter4.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter4.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter4.position,
            {
                y: letter4.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter5.position,
            {
                y: letter5.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter5.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter5.position,
            {
                y: letter5.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter6.position,
            {
                y: letter6.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter6.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter6.position,
            {
                y: letter6.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter7.position,
            {
                y: letter7.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter7.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter7.position,
            {
                y: letter7.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter8.position,
            {
                y: letter8.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter8.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter8.position,
            {
                y: letter8.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        );

    const pianoKeysTl = gsap.timeline({
        defaults: {
            duration: 0.4,
            ease: "back.out(1.7)",
        },
    });
    pianoKeysTl.timeScale(1.2);

    const pianoKeys = [
        C1_Key,
        Cs1_Key,
        D1_Key,
        Ds1_Key,
        E1_Key,
        F1_Key,
        Fs1_Key,
        G1_Key,
        Gs1_Key,
        A1_Key,
        As1_Key,
        B1_Key,
        C2_Key,
        Cs2_Key,
        D2_Key,
        Ds2_Key,
        E2_Key,
        F2_Key,
        Fs2_Key,
        G2_Key,
        Gs2_Key,
        A2_Key,
        As2_Key,
        B2_Key,
    ];

    pianoKeys.forEach((key, index) => {
        pianoKeysTl
            .to(
                key.position,
                {
                    y: key.userData.initialPosition.y + 0.2,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                index * 0.1
            )
            .to(
                key.scale,
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                "<"
            )
            .to(
                key.position,
                {
                    y: key.userData.initialPosition.y,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                ">-0.2"
            );
    });
}